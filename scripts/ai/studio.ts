/**
 * Render studio: a local page for reviewing generated images.
 * Run with `npm run studio`, then open http://127.0.0.1:5180
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { basename, join } from 'node:path';
import { milestones } from '../../src/data/renderSheets';
import { listRenderItems, type RenderItem } from '../../src/production/prompts';
import { ComfyError } from './comfy';
import { loadConfig } from './config';
import { generateVariants, openSession, promptFor, type Session } from './run';
import { candidateDir, chosenFile, listCandidates, loadOverrides, loadPicks, saveOverride, useCandidate } from './store';

const PORT = 5180;
const cfg = loadConfig();
const items = listRenderItems();
const byId = new Map(items.map((i) => [i.id, i]));

// --- ComfyUI connection (checked lazily, re-checked when it was down) -------
let session: Session | null = null;
let comfyError: string | null = null;
let lastCheck = 0;
async function connect(force = false): Promise<Session | null> {
  // Re-check every few seconds so the page notices when ComfyUI is started or closed,
  // but never in the middle of a job (the job itself reports failures).
  if (!force && (running || Date.now() - lastCheck < 6000)) return session;
  lastCheck = Date.now();
  try {
    session = await openSession(cfg);
    comfyError = null;
  } catch (e) {
    session = null;
    comfyError = (e as Error).message;
  }
  return session;
}

// --- One-at-a-time generation queue ---------------------------------------
const queue: { item: RenderItem; count: number }[] = [];
let running: string | null = null;
let jobError: string | null = null;
async function work() {
  if (running) return;
  for (;;) {
    const job = queue.shift();
    if (!job) break;
    running = job.item.id;
    try {
      const s = await connect(true);
      if (!s) throw new ComfyError(comfyError ?? 'ComfyUI is not available.');
      await generateVariants(s, job.item, job.count);
      jobError = null;
    } catch (e) {
      jobError = `${job.item.id}: ${(e as Error).message}`;
      queue.length = 0; // stop the batch; the cause usually affects every image
    }
  }
  running = null;
}

// --- HTTP helpers ------------------------------------------------------------
const json = (res: ServerResponse, body: unknown, status = 200) => {
  res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' });
  res.end(JSON.stringify(body));
};
const readBody = (req: IncomingMessage) =>
  new Promise<Record<string, unknown>>((resolve) => {
    let data = '';
    req.on('data', (c: Buffer) => (data += c.toString()));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}') as Record<string, unknown>);
      } catch {
        resolve({});
      }
    });
  });
const sendImage = (res: ServerResponse, path: string | null) => {
  if (!path || !existsSync(path)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const ext = path.split('.').pop()!.toLowerCase();
  const type = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(readFileSync(path));
};

async function state() {
  await connect();
  const overrides = loadOverrides();
  const picks = loadPicks();
  return {
    comfy: session ? { ok: true, gpu: session.gpu, checkpoint: session.checkpoint } : { ok: false, error: comfyError },
    job: { running, queued: queue.length, error: jobError },
    milestones: milestones.map((m, i) => ({ n: i + 1, name: m.name, scenes: m.scenes })),
    items: items.map((item) => {
      const chosen = chosenFile(item);
      return {
        id: item.id,
        kind: item.kind,
        title: item.title,
        scene: item.scene,
        sceneTitle: item.sceneTitle,
        brief: item.brief,
        prompt: promptFor(cfg, item).positive,
        extra: overrides[item.id]?.extra ?? '',
        chosen: chosen ? `/chosen/${item.id}?v=${statSync(chosen).mtimeMs}` : null,
        picked: picks[item.id]?.file ?? null,
        confirmed: Boolean(chosen && picks[item.id]?.confirmed),
        candidates: listCandidates(item).map((p) => basename(p)),
      };
    }),
  };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = decodeURIComponent(url.pathname);
  try {
    if (req.method === 'GET' && path === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end(PAGE);
    } else if (req.method === 'GET' && path === '/api/state') {
      json(res, await state());
    } else if (req.method === 'GET' && path.startsWith('/chosen/')) {
      const item = byId.get(path.slice('/chosen/'.length));
      sendImage(res, item ? chosenFile(item) : null);
    } else if (req.method === 'GET' && path.startsWith('/candidate/')) {
      // /candidate/<id>/<file> — the file name is reduced to its base name, so it cannot leave the folder.
      const [, , id = '', file = ''] = path.split('/');
      const item = byId.get(id);
      sendImage(res, item ? join(candidateDir(item), basename(file)) : null);
    } else if (req.method === 'POST' && path === '/api/generate') {
      const body = await readBody(req);
      const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
      const count = Math.min(8, Math.max(1, Number(body.count) || 2));
      for (const id of ids) {
        const item = byId.get(id);
        if (item && !queue.some((q) => q.item.id === id) && running !== id) queue.push({ item, count });
      }
      jobError = null;
      void work();
      json(res, { queued: queue.length });
    } else if (req.method === 'POST' && path === '/api/use') {
      const body = await readBody(req);
      const item = byId.get(String(body.id));
      const file = item ? join(candidateDir(item), basename(String(body.file))) : '';
      if (!item || !existsSync(file)) return json(res, { error: 'not found' }, 404);
      useCandidate(item, file, true);
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/extra') {
      const body = await readBody(req);
      if (!byId.has(String(body.id))) return json(res, { error: 'not found' }, 404);
      saveOverride(String(body.id), { extra: String(body.extra ?? '') });
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/stop') {
      queue.length = 0;
      json(res, { ok: true });
    } else {
      res.writeHead(404);
      res.end();
    }
  } catch (e) {
    json(res, { error: (e as Error).message }, 500);
  }
});

// Local only: the studio can overwrite files, so it never listens on the network.
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Render studio: http://127.0.0.1:${PORT}   (Ctrl+C to stop)`);
});

// ---------------------------------------------------------------------------
// The page. Plain HTML and JavaScript, no build step.
// ---------------------------------------------------------------------------
const PAGE = /* html */ `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Halcyon render studio</title>
<style>
  :root { color-scheme: dark; --gold: #e8c88f; --line: #ffffff1a; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #0c0d11; color: #e9e6df; font: 15px/1.5 system-ui, sans-serif; }
  header { position: sticky; top: 0; z-index: 5; background: #0c0d11ee; backdrop-filter: blur(8px); border-bottom: 1px solid var(--line); padding: 14px 24px; display: flex; flex-wrap: wrap; gap: 14px 22px; align-items: center; }
  h1 { font: 500 20px Georgia, serif; margin: 0; letter-spacing: .04em; }
  h2 { font: 500 22px Georgia, serif; margin: 34px 0 12px; display: flex; align-items: center; gap: 14px; }
  h2 small { font: 13px system-ui; color: #ffffff80; }
  main { padding: 0 24px 80px; max-width: 1500px; margin: 0 auto; }
  button, select, input { font: inherit; color: inherit; }
  button { background: #ffffff10; border: 1px solid var(--line); border-radius: 999px; padding: 6px 14px; cursor: pointer; }
  button:hover { border-color: var(--gold); }
  button.primary { background: var(--gold); color: #111; border-color: var(--gold); }
  button:disabled { opacity: .4; cursor: default; }
  select, input[type=text] { background: #ffffff0d; border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px; }
  .pill { padding: 3px 10px; border-radius: 999px; font-size: 13px; border: 1px solid var(--line); }
  .ok { color: #9be0a8; } .bad { color: #ff9f9f; } .busy { color: var(--gold); }
  .card { border: 1px solid var(--line); border-radius: 14px; padding: 14px; margin-bottom: 14px; display: grid; grid-template-columns: 340px 1fr; gap: 18px; }
  .chosen { width: 340px; aspect-ratio: 16/9; border-radius: 8px; background: #ffffff08; display: flex; align-items: center; justify-content: center; color: #ffffff55; overflow: hidden; }
  .chosen.portrait { aspect-ratio: 7/9; width: 220px; }
  .chosen img { width: 100%; height: 100%; object-fit: cover; cursor: zoom-in; }
  .id { font: 14px ui-monospace, monospace; color: var(--gold); }
  .brief { color: #ffffffb0; margin: 4px 0 8px; max-width: 95ch; }
  details { color: #ffffff80; font-size: 13px; margin-bottom: 8px; } details p { margin: 6px 0; white-space: pre-wrap; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
  .row input[type=text] { flex: 1; min-width: 240px; }
  .strip { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
  .cand { flex: 0 0 auto; text-align: center; }
  .cand img { height: 124px; border-radius: 6px; display: block; cursor: zoom-in; border: 2px solid transparent; }
  .cand.picked img { border-color: var(--gold); }
  .cand button { margin-top: 6px; font-size: 13px; padding: 3px 12px; }
  #lightbox { position: fixed; inset: 0; background: #000e; display: none; align-items: center; justify-content: center; z-index: 20; cursor: zoom-out; }
  #lightbox img { max-width: 96vw; max-height: 94vh; }
  #error { background: #5a1f1f; padding: 10px 24px; display: none; }
</style></head><body>
<header>
  <h1>Halcyon render studio</h1>
  <span id="comfy" class="pill">Connecting…</span>
  <span id="progress" class="pill"></span>
  <span id="job" class="pill busy" style="display:none"></span>
  <button id="stop" style="display:none">Stop</button>
  <label>Show <select id="filter"><option value="todo">to do</option><option value="all">all</option><option value="done">confirmed</option></select></label>
  <label>Versions per image <select id="count"><option>2</option><option>3</option><option>4</option><option>1</option></select></label>
  <span id="milestones"></span>
</header>
<div id="error"></div>
<main id="main"></main>
<div id="lightbox"><img alt=""></div>
<script>
var S = null, sigs = {};
function el(tag, attrs, kids) {
  var e = document.createElement(tag);
  for (var k in attrs || {}) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') e.textContent = v; else if (k.slice(0, 2) === 'on') e[k] = v; else e.setAttribute(k, v === true ? '' : v);
  }
  (kids || []).forEach(function (c) { if (c) e.appendChild(c); });
  return e;
}
function post(path, body) { return fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(refresh); }
function count() { return Number(document.getElementById('count').value); }
function zoom(src) { var lb = document.getElementById('lightbox'); lb.querySelector('img').src = src; lb.style.display = 'flex'; }
document.getElementById('lightbox').onclick = function () { this.style.display = 'none'; };
document.getElementById('filter').onchange = function () { sigs = {}; document.getElementById('main').innerHTML = ''; render(); };
document.getElementById('stop').onclick = function () { post('/api/stop', {}); };

function card(it) {
  var portrait = it.kind === 'refs';
  var chosen = el('div', { class: 'chosen' + (portrait ? ' portrait' : '') }, [it.chosen ? el('img', { src: it.chosen, alt: '', onclick: function () { zoom(it.chosen); } }) : el('span', { text: 'No image yet' })]);
  var extra = el('input', { type: 'text', placeholder: 'Add to the prompt for this image, e.g. "heavier fog, she looks at the camera"', value: it.extra });
  var strip = el('div', { class: 'strip' }, it.candidates.map(function (f) {
    var src = '/candidate/' + it.id + '/' + f;
    return el('div', { class: 'cand' + (it.picked === f ? ' picked' : '') }, [
      el('img', { src: src, alt: '', loading: 'lazy', onclick: function () { zoom(src); } }),
      el('button', { class: it.picked === f && it.confirmed ? 'primary' : '', text: it.picked === f ? (it.confirmed ? 'Chosen' : 'Keep this one') : 'Use this', onclick: function () { post('/api/use', { id: it.id, file: f }); } })
    ]);
  }));
  var busy = S.job.running === it.id;
  return el('div', { class: 'card', id: 'card-' + it.id }, [chosen, el('div', {}, [
    el('div', { class: 'id', text: it.id + (it.kind === 'cg' ? '  ·  illustration: ' + it.title : it.kind === 'refs' ? '  ·  ' + it.title : '') }),
    el('div', { class: 'brief', text: it.brief }),
    el('details', {}, [el('summary', { text: 'Prompt sent to the image generator' }), el('p', { text: it.prompt })]),
    el('div', { class: 'row' }, [extra,
      el('button', { text: 'Save note', onclick: function () { post('/api/extra', { id: it.id, extra: extra.value }); } }),
      el('button', { class: 'primary', text: busy ? 'Generating…' : 'Generate ' + count() + ' more', disabled: busy, onclick: function () { post('/api/generate', { ids: [it.id], count: count() }); } })
    ]),
    strip
  ])]);
}

function render() {
  if (!S) return;
  var c = document.getElementById('comfy');
  c.className = 'pill ' + (S.comfy.ok ? 'ok' : 'bad');
  c.textContent = S.comfy.ok ? 'Image generator ready: ' + (S.comfy.gpu || 'connected') + ' · ' + S.comfy.checkpoint : 'Image generator not available';
  var err = document.getElementById('error'), msg = S.job.error || (S.comfy.ok ? '' : S.comfy.error);
  err.style.display = msg ? 'block' : 'none'; err.textContent = msg || '';
  var game = S.items.filter(function (i) { return i.kind !== 'refs'; });
  document.getElementById('progress').textContent = game.filter(function (i) { return i.confirmed; }).length + ' of ' + game.length + ' confirmed · ' + game.filter(function (i) { return i.chosen; }).length + ' have an image';
  var j = document.getElementById('job'), busy = S.job.running;
  j.style.display = busy ? '' : 'none'; j.textContent = busy ? 'Generating ' + busy + (S.job.queued ? ' · ' + S.job.queued + ' waiting' : '') : '';
  document.getElementById('stop').style.display = busy && S.job.queued ? '' : 'none';

  var ms = document.getElementById('milestones');
  if (!ms.childNodes.length) S.milestones.forEach(function (m) {
    ms.appendChild(el('button', { text: 'Generate missing: ' + m.n + '. ' + m.name, onclick: function () {
      var ids = S.items.filter(function (i) { return i.scene && m.scenes.indexOf(i.scene) >= 0 && !i.chosen; }).map(function (i) { return i.id; });
      if (ids.length) post('/api/generate', { ids: ids, count: count() });
    } }));
    ms.appendChild(document.createTextNode(' '));
  });

  var filter = document.getElementById('filter').value, main = document.getElementById('main'), groups = {}, order = [];
  S.items.forEach(function (it) {
    // "To do" means you have not confirmed a choice yet, even if a first version is already in the game.
    if (filter === 'todo' && it.confirmed) return;
    if (filter === 'done' && !it.confirmed) return;
    if (!groups[it.sceneTitle]) { groups[it.sceneTitle] = []; order.push(it.sceneTitle); }
    groups[it.sceneTitle].push(it);
  });
  order.forEach(function (title) {
    var sec = document.getElementById('sec-' + title);
    if (!sec) {
      sec = el('section', { id: 'sec-' + title }, [el('h2', {}, [document.createTextNode(title), el('small', {}),
        el('button', { text: 'Generate missing in this scene', onclick: function () {
          var ids = S.items.filter(function (i) { return i.sceneTitle === title && !i.chosen; }).map(function (i) { return i.id; });
          if (ids.length) post('/api/generate', { ids: ids, count: count() });
        } })])]);
      main.appendChild(sec);
    }
    var list = groups[title];
    sec.querySelector('small').textContent = list.filter(function (i) { return i.confirmed; }).length + ' / ' + list.length + ' confirmed';
    list.forEach(function (it) {
      var sig = JSON.stringify([it.chosen, it.picked, it.confirmed, it.candidates, it.extra, S.job.running === it.id]);
      var existing = document.getElementById('card-' + it.id);
      if (existing && sigs[it.id] === sig) return;
      // Do not replace a card while its note is being typed.
      if (existing && existing.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') return;
      sigs[it.id] = sig;
      var fresh = card(it);
      if (existing) existing.replaceWith(fresh); else sec.appendChild(fresh);
    });
  });
}
function prune() {
  // Remove cards that no longer match the filter, and sections left empty.
  var filter = document.getElementById('filter').value, keep = {};
  S.items.forEach(function (it) { if (!((filter === 'todo' && it.confirmed) || (filter === 'done' && !it.confirmed))) keep['card-' + it.id] = true; });
  Array.prototype.slice.call(document.querySelectorAll('.card')).forEach(function (c) {
    if (!keep[c.id] && !(c.contains(document.activeElement) && document.activeElement.tagName === 'INPUT')) { delete sigs[c.id.slice(5)]; c.remove(); }
  });
  Array.prototype.slice.call(document.querySelectorAll('main section')).forEach(function (sec) { if (!sec.querySelector('.card')) sec.remove(); });
}
function refresh() { return fetch('/api/state').then(function (r) { return r.json(); }).then(function (s) { S = s; render(); prune(); }).catch(function () {}); }
refresh(); setInterval(refresh, 2500);
</script></body></html>`;
