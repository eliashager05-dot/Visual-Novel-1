/**
 * Render studio: a local page for reviewing generated images.
 * Run with `npm run studio`, then open http://127.0.0.1:5180
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { exec } from 'node:child_process';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { basename, join } from 'node:path';
import { content } from '../../src/data';
import { milestones } from '../../src/data/renderSheets';
import { GOOD_IMAGES, isSoloOf, loraCharacters, loraTrigger, MIN_IMAGES } from '../../src/production/lora';
import { listRenderItems, type RenderItem } from '../../src/production/prompts';
import { animateWorkflowPath, ComfyError, inspectComfy } from './comfy';
import { loadConfig, ROOT } from './config';
import { buildDataset, DATASETS, generateVariations, listVariations, setInTrainingSet, trainingSet, variationDir } from './lora';
import { animateClip, clipPromptFor, generateVariants, openSession, promptFor, type Session } from './run';
import {
  candidateDir, chosenFile, clipDir, gameClip, listCandidates, listClips, loadClipPicks, loadOverrides, loadPicks,
  removeGameClip, saveOverride, useCandidate, useClip, type ClipMode,
} from './store';

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

// --- One-at-a-time generation queue (images and clips) -----------------------
type Job = { item: RenderItem; count: number; kind: 'image' | 'clip' | 'variations' };
const queue: Job[] = [];
let running: { id: string; kind: Job['kind']; since: number } | null = null;
let jobError: string | null = null;
async function work() {
  if (running) return;
  for (;;) {
    const job = queue.shift();
    if (!job) break;
    running = { id: job.item.id, kind: job.kind, since: Date.now() };
    try {
      if (job.kind === 'variations') {
        const s = await connect(true);
        if (!s) throw new ComfyError(comfyError ?? 'ComfyUI is not available.');
        await generateVariations(s, job.item.characters[0]!, job.count);
      } else if (job.kind === 'clip') {
        // Clips only need ComfyUI to be reachable; the workflow names its own models.
        await inspectComfy(cfg);
        for (let k = 0; k < job.count; k++) await animateClip(cfg, job.item);
      } else {
        const s = await connect(true);
        if (!s) throw new ComfyError(comfyError ?? 'ComfyUI is not available.');
        await generateVariants(s, job.item, job.count);
      }
      jobError = null;
    } catch (e) {
      jobError = `${job.item.id}: ${(e as Error).message}`;
      queue.length = 0; // stop the batch; the cause usually affects every image
    }
  }
  running = null;
}
const isQueued = (id: string, kind: Job['kind']) =>
  queue.some((q) => q.item.id === id && q.kind === kind) || (running?.id === id && running.kind === kind);

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
/** Only plain files are served; a folder or a missing name is "not found". */
const isFile = (path: string | null): path is string => Boolean(path && existsSync(path) && statSync(path).isFile());

/** Sends a clip, with byte ranges so the browser can seek and loop it. */
const sendVideo = (req: IncomingMessage, res: ServerResponse, path: string | null) => {
  if (!isFile(path)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const data = readFileSync(path);
  const type = path.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? '');
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
    res.writeHead(206, {
      'content-type': type,
      'content-range': `bytes ${start}-${end}/${data.length}`,
      'accept-ranges': 'bytes',
      'content-length': end - start + 1,
      'cache-control': 'no-store',
    });
    res.end(data.subarray(start, end + 1));
    return;
  }
  res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': data.length, 'cache-control': 'no-store' });
  res.end(data);
};
const sendImage = (res: ServerResponse, path: string | null) => {
  if (!isFile(path)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const ext = path.split('.').pop()!.toLowerCase();
  const type = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(readFileSync(path));
};

// --- Character LoRA training sets -------------------------------------------------
let loraMessage: { id: string; text: string; ok: boolean } | null = null;

/** File names (in one folder) that are in a character's training set. */
function inSetNames(charId: string, folder: string): string[] {
  return trainingSet(charId).filter((r) => r.startsWith(folder)).map((r) => r.slice(folder.length));
}

function loraState() {
  return {
    min: MIN_IMAGES,
    good: GOOD_IMAGES,
    message: loraMessage,
    characters: loraCharacters().map((id) => {
      const set = trainingSet(id);
      const ref = byId.get(`ref_${id}`)!;
      return {
        id,
        name: content.characters[id]?.name ?? id,
        short: id === 'player' ? 'Protagonist' : (content.characters[id]?.shortName ?? content.characters[id]?.name ?? id),
        trigger: cfg.loras[id]?.trigger || loraTrigger(id),
        lora: cfg.loras[id]?.file || null,
        count: set.length,
        fromGame: set.filter((r) => !r.startsWith('render-candidates/lora/')),
        variations: listVariations(id).map((p) => basename(p)),
        inSet: inSetNames(id, `render-candidates/lora/${id}/`),
        making: isQueued(ref.id, 'variations'),
        built: existsSync(join(DATASETS, id, 'train.toml')),
      };
    }),
  };
}

async function state() {
  await connect();
  const overrides = loadOverrides();
  const picks = loadPicks();
  const clipPicks = loadClipPicks();
  const wf = animateWorkflowPath(cfg);
  return {
    comfy: session ? { ok: true, gpu: session.gpu, checkpoint: session.checkpoint } : { ok: false, error: comfyError },
    job: {
      running: running?.id ?? null,
      kind: running?.kind ?? null,
      seconds: running ? Math.round((Date.now() - running.since) / 1000) : 0,
      queued: queue.length,
      error: jobError,
    },
    animate: { ready: wf.exists, workflow: cfg.animateWorkflow },
    lora: loraState(),
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
        canAnimate: item.kind !== 'refs' && Boolean(chosen),
        motion: overrides[item.id]?.motion ?? '',
        clipPrompt: item.kind === 'refs' ? '' : clipPromptFor(item),
        clips: item.kind === 'refs' ? [] : listClips(item).map((p) => basename(p)),
        clip: (() => {
          const g = gameClip(item);
          return g ? { mode: g.mode, file: clipPicks[item.id] ?? null } : null;
        })(),
        animating: isQueued(item.id, 'clip'),
        // Pictures of one character alone can go in that character's LoRA training set.
        solo: item.characters.length === 1 && isSoloOf(item, item.characters[0]!) ? item.characters[0] : null,
        inSet: item.characters.length === 1 ? inSetNames(item.characters[0]!, `render-candidates/${item.kind}/${item.id}/`) : [],
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
    } else if (req.method === 'GET' && path.startsWith('/clip/')) {
      const [, , id = '', file = ''] = path.split('/');
      const item = byId.get(id);
      sendVideo(req, res, item ? join(clipDir(item), basename(file)) : null);
    } else if (req.method === 'GET' && path.startsWith('/lora-img/')) {
      // /lora-img/<character>/<file> — a variation; /lora-img/<character>/game/<path> — a picture from the game.
      const [, , id = '', ...rest] = path.split('/');
      if (!loraCharacters().includes(id)) return sendImage(res, null);
      if (rest[0] === 'game') {
        const r = rest.slice(1).join('/');
        return sendImage(res, trainingSet(id).includes(r) ? join(ROOT, ...r.split('/')) : null);
      }
      sendImage(res, join(variationDir(id), basename(rest.join('/'))));
    } else if (req.method === 'POST' && path === '/api/lora/variations') {
      const body = await readBody(req);
      const ref = byId.get(`ref_${String(body.id)}`);
      if (!ref) return json(res, { error: 'not found' }, 404);
      const count = Math.min(12, Math.max(1, Number(body.count) || 6));
      if (!isQueued(ref.id, 'variations')) queue.push({ item: ref, count, kind: 'variations' });
      jobError = null;
      void work();
      json(res, { queued: queue.length });
    } else if (req.method === 'POST' && path === '/api/lora/toggle') {
      // { id: character, kind: 'variation' | 'candidate', item?: render item id, file, on }
      const body = await readBody(req);
      const id = String(body.id);
      const file = basename(String(body.file));
      let target: string | null = null;
      if (body.kind === 'variation') target = join(variationDir(id), file);
      else {
        const item = byId.get(String(body.item));
        if (item) target = join(candidateDir(item), file);
      }
      if (!target) return json(res, { error: 'not found' }, 404);
      try {
        setInTrainingSet(id, target, Boolean(body.on));
      } catch (e) {
        return json(res, { error: (e as Error).message }, 400);
      }
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/lora/build') {
      const body = await readBody(req);
      const id = String(body.id);
      try {
        const r = await buildDataset(cfg, id);
        loraMessage = { id, ok: true, text: `Training folder ready: ${r.dir} (${r.images} pictures).${r.warning ? ' ' + r.warning : ''} Next: README.txt in that folder.` };
      } catch (e) {
        loraMessage = { id, ok: false, text: (e as Error).message };
      }
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/animate') {
      const body = await readBody(req);
      const item = byId.get(String(body.id));
      if (!item || item.kind === 'refs') return json(res, { error: 'not found' }, 404);
      if (!animateWorkflowPath(cfg).exists) return json(res, { error: 'no animation workflow' }, 400);
      if (!isQueued(item.id, 'clip')) queue.push({ item, count: 1, kind: 'clip' });
      jobError = null;
      void work();
      json(res, { queued: queue.length });
    } else if (req.method === 'POST' && path === '/api/use-clip') {
      const body = await readBody(req);
      const item = byId.get(String(body.id));
      const file = item ? join(clipDir(item), basename(String(body.file))) : '';
      const mode: ClipMode = body.mode === 'once' ? 'once' : 'loop';
      if (!item || !existsSync(file)) return json(res, { error: 'not found' }, 404);
      useClip(item, file, mode);
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/remove-clip') {
      const body = await readBody(req);
      const item = byId.get(String(body.id));
      if (!item) return json(res, { error: 'not found' }, 404);
      removeGameClip(item);
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/motion') {
      const body = await readBody(req);
      if (!byId.has(String(body.id))) return json(res, { error: 'not found' }, 404);
      saveOverride(String(body.id), { motion: String(body.motion ?? '') });
      json(res, { ok: true });
    } else if (req.method === 'POST' && path === '/api/generate') {
      const body = await readBody(req);
      const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
      const count = Math.min(8, Math.max(1, Number(body.count) || 2));
      for (const id of ids) {
        const item = byId.get(id);
        if (item && !isQueued(id, 'image')) queue.push({ item, count, kind: 'image' });
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
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`Render studio: ${url}   (Ctrl+C to stop)`);
  // `--open` (used by "Render Studio.bat") opens the page in the default browser.
  if (process.argv.includes('--open')) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd, () => undefined);
  }
});
server.on('error', (e: NodeJS.ErrnoException) => {
  console.error(e.code === 'EADDRINUSE' ? `The render studio is already running: open http://127.0.0.1:${PORT}` : e.message);
  process.exitCode = 1;
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
  #lightbox img, #lightbox video { max-width: 96vw; max-height: 94vh; }
  #lorawrap { max-width: 1500px; margin: 0 auto; padding: 0 24px; }
  #lora-panel { border: 1px solid var(--line); border-radius: 14px; margin-top: 18px; padding: 4px 16px; color: inherit; font-size: 15px; }
  #lora-panel > summary { cursor: pointer; padding: 10px 0; font: 500 20px Georgia, serif; }
  #lora-panel > summary small { font: 13px system-ui; color: #ffffff80; margin-left: 10px; }
  .lintro { color: #ffffffa0; max-width: 100ch; margin: 0 0 10px; }
  .lchar { border-top: 1px solid var(--line); padding: 14px 0; }
  .lhead { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 8px; }
  .lhead b { font: 500 18px Georgia, serif; }
  .lmsg { margin: 0 0 8px; font-size: 14px; } .lmsg.ok { color: #9be0a8; } .lmsg.bad { color: #ff9f9f; }
  .cand img.tall { height: 150px; }
  .cand .set { display: block; margin: 4px auto 0; }
  .set.on { background: #2f4a33; border-color: #9be0a8; color: #c9f2d1; }
  .sub { font-size: 13px; color: #ffffff80; margin: 6px 0; }
  .anim { margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--line); }
  .label { font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); margin-bottom: 6px; }
  .hint { color: #ffffff80; font-size: 13px; margin: -4px 0 8px; }
  .cand video { height: 124px; border-radius: 6px; display: block; cursor: zoom-in; border: 2px solid transparent; background: #000; }
  .cand.picked video { border-color: var(--gold); }
  #error { background: #5a1f1f; padding: 10px 24px; display: none; }
</style></head><body>
<header>
  <h1>Halcyon render studio</h1>
  <span id="comfy" class="pill">Connecting…</span>
  <span id="progress" class="pill"></span>
  <span id="animate" class="pill"></span>
  <span id="job" class="pill busy" style="display:none"></span>
  <button id="stop" style="display:none">Stop</button>
  <label>Show <select id="filter"><option value="todo">to do</option><option value="all">all</option><option value="done">confirmed</option></select></label>
  <label>Versions per image <select id="count"><option>2</option><option>3</option><option>4</option><option>1</option></select></label>
  <span id="milestones"></span>
</header>
<div id="error"></div>
<div id="lorawrap"></div>
<main id="main"></main>
<div id="lightbox"><img alt=""><video controls loop muted playsinline></video></div>
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
function zoom(src, video) {
  var lb = document.getElementById('lightbox'), img = lb.querySelector('img'), v = lb.querySelector('video');
  img.style.display = video ? 'none' : ''; v.style.display = video ? '' : 'none';
  if (video) { v.src = src; v.play(); } else img.src = src;
  lb.style.display = 'flex';
}
document.getElementById('lightbox').onclick = function (e) {
  if (e.target.tagName === 'VIDEO') return;
  var v = this.querySelector('video'); v.pause(); v.removeAttribute('src');
  this.style.display = 'none';
};
function duration(s) { return s >= 60 ? Math.floor(s / 60) + ' min ' + (s % 60) + ' s' : s + ' s'; }

/** "+ Training set" / "✓ In training set" for a picture of one character alone. */
function setButton(charId, on, target) {
  var c = S.lora.characters.filter(function (x) { return x.id === charId; })[0] || {}, name = c.name || charId, short = c.short || charId;
  return el('button', { class: 'set' + (on ? ' on' : ''), title: on ? 'Remove from ' + name + "'s LoRA training set" : 'Add to ' + name + "'s LoRA training set",
    text: on ? '✓ In ' + short + "'s set" : '+ Training set',
    onclick: function () { post('/api/lora/toggle', { id: charId, kind: target.kind, item: target.item, file: target.file, on: !on }); } });
}

var loraSig = {};
function renderLora() {
  var wrap = document.getElementById('lorawrap'), L = S.lora;
  var panel = document.getElementById('lora-panel');
  if (!panel) {
    panel = el('details', { id: 'lora-panel' }, [
      el('summary', {}, [document.createTextNode('Character consistency (LoRA)'), el('small', { id: 'lora-sum' })]),
      el('p', { class: 'lintro', text: 'A LoRA is a small add-on model trained on pictures of one character, so the generator draws the same face every time. ' +
        'Collect ' + L.min + '–40 pictures (about ' + L.good + ' is good) where the character looks exactly right: use "+ Training set" under any picture of them alone, ' +
        'or make varied pictures here and keep only the ones that match. Then build the training folder. Full steps: docs/LORA_GUIDE.md.' })
    ]);
    wrap.appendChild(panel);
  }
  document.getElementById('lora-sum').textContent = L.characters.map(function (c) { return c.short + ' ' + c.count; }).join(' · ');
  L.characters.forEach(function (c) {
    var msg = L.message && L.message.id === c.id ? L.message : null;
    var sig = JSON.stringify([c, msg, S.comfy.ok]);
    var row = document.getElementById('lora-' + c.id);
    if (row && loraSig[c.id] === sig) return;
    loraSig[c.id] = sig;
    var vstrip = el('div', { class: 'strip' }, c.variations.map(function (f) {
      var src = '/lora-img/' + c.id + '/' + f, on = c.inSet.indexOf(f) >= 0;
      return el('div', { class: 'cand' + (on ? ' picked' : '') }, [
        el('img', { class: 'tall', src: src, alt: '', loading: 'lazy', onclick: function () { zoom(src); } }),
        setButton(c.id, on, { kind: 'variation', file: f })
      ]);
    }));
    var gstrip = el('div', { class: 'strip' }, c.fromGame.map(function (r) {
      var parts = r.split('/'), src = '/lora-img/' + c.id + '/game/' + r;
      return el('div', { class: 'cand picked' }, [
        el('img', { src: src, alt: '', loading: 'lazy', onclick: function () { zoom(src); } }),
        setButton(c.id, true, { kind: 'candidate', item: parts[2], file: parts[3] })
      ]);
    }));
    var fresh = el('div', { class: 'lchar', id: 'lora-' + c.id }, [
      el('div', { class: 'lhead' }, [
        el('b', { text: c.name }),
        el('span', { class: 'id', text: 'trigger: ' + c.trigger }),
        el('span', { class: 'pill ' + (c.count >= L.good ? 'ok' : c.count >= L.min ? 'busy' : ''), text: c.count + ' in training set · aim for ' + L.good }),
        c.lora ? el('span', { class: 'pill ok', text: 'LoRA in use: ' + c.lora }) : null,
        el('button', { text: c.making ? 'Making variations…' : 'Make 6 variations', disabled: c.making || !S.comfy.ok, title: S.comfy.ok ? 'Varied angles, moods, outfits and places. Keep only the ones that look exactly like ' + c.name : 'The image generator is not available', onclick: function () { post('/api/lora/variations', { id: c.id, count: 6 }); } }),
        el('button', { class: 'primary', text: 'Build training folder', disabled: c.count < L.min, title: c.count < L.min ? 'Pick at least ' + L.min + ' pictures first' : 'Writes lora-datasets/' + c.id, onclick: function () { post('/api/lora/build', { id: c.id }); } })
      ]),
      msg ? el('div', { class: 'lmsg ' + (msg.ok ? 'ok' : 'bad'), text: msg.text }) : null,
      c.variations.length ? el('div', { class: 'sub', text: 'Variations (' + c.inSet.length + ' of ' + c.variations.length + ' in the set)' }) : null,
      c.variations.length ? vstrip : null,
      c.fromGame.length ? el('div', { class: 'sub', text: 'From the game (' + c.fromGame.length + ')' }) : null,
      c.fromGame.length ? gstrip : null
    ]);
    if (row) row.replaceWith(fresh); else panel.appendChild(fresh);
  });
}

function animation(it) {
  if (it.kind === 'refs') return null;
  var motion = el('input', { type: 'text', placeholder: 'Movement for the clip, e.g. "she laughs and looks away, wind in her hair, slow push-in"', value: it.motion });
  var mode = el('select', { title: 'How the game plays the clip' }, [el('option', { value: 'loop', text: 'Loops' }), el('option', { value: 'once', text: 'Plays once, then holds' })]);
  if (it.clip) mode.value = it.clip.mode;
  mode.onchange = function () { if (it.clip && it.clip.file) post('/api/use-clip', { id: it.id, file: it.clip.file, mode: mode.value }); };
  var why = !it.canAnimate ? 'Choose an image for this shot first: the clip is made from it.'
    : !S.animate.ready ? 'To animate, save your image-to-video workflow from ComfyUI as ' + S.animate.workflow + ' (AI guide, section 10).' : '';
  var clips = el('div', { class: 'strip' }, it.clips.map(function (f) {
    var src = '/clip/' + it.id + '/' + f, inGame = it.clip && it.clip.file === f;
    var v = el('video', { src: src, muted: true, loop: true, playsinline: true, preload: 'metadata' });
    v.muted = true;
    v.onmouseenter = function () { v.play().catch(function () {}); };
    v.onmouseleave = function () { v.pause(); };
    v.onclick = function () { zoom(src, true); };
    return el('div', { class: 'cand' + (inGame ? ' picked' : '') }, [v,
      el('button', { class: inGame ? 'primary' : '', text: inGame ? 'In the game' : 'Use this clip', onclick: function () { post('/api/use-clip', { id: it.id, file: f, mode: mode.value }); } })]);
  }));
  return el('div', { class: 'anim' }, [
    el('div', { class: 'label', text: 'Animation' + (it.clip ? ' · in the game, ' + (it.clip.mode === 'once' ? 'plays once' : 'loops') : '') }),
    el('details', {}, [el('summary', { text: 'Prompt sent to the video generator' }), el('p', { text: it.clipPrompt })]),
    el('div', { class: 'row' }, [motion,
      el('button', { text: 'Save movement', onclick: function () { post('/api/motion', { id: it.id, motion: motion.value }); } }),
      mode,
      el('button', { class: 'primary', text: it.animating ? 'Animating…' : 'Animate', disabled: Boolean(why) || it.animating, title: why || 'Make one new clip from the chosen image', onclick: function () { post('/api/animate', { id: it.id }); } }),
      it.clip ? el('button', { text: 'Remove clip from game', onclick: function () { post('/api/remove-clip', { id: it.id }); } }) : null
    ]),
    why ? el('div', { class: 'hint', text: why }) : null,
    it.clips.length ? clips : null
  ]);
}
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
      el('button', { class: it.picked === f && it.confirmed ? 'primary' : '', text: it.picked === f ? (it.confirmed ? 'Chosen' : 'Keep this one') : 'Use this', onclick: function () { post('/api/use', { id: it.id, file: f }); } }),
      it.solo ? setButton(it.solo, it.inSet.indexOf(f) >= 0, { kind: 'candidate', item: it.id, file: f }) : null
    ]);
  }));
  var busy = S.job.running === it.id && S.job.kind === 'image';
  return el('div', { class: 'card', id: 'card-' + it.id }, [chosen, el('div', {}, [
    el('div', { class: 'id', text: it.id + (it.kind === 'cg' ? '  ·  illustration: ' + it.title : it.kind === 'refs' ? '  ·  ' + it.title : '') }),
    el('div', { class: 'brief', text: it.brief }),
    el('details', {}, [el('summary', { text: 'Prompt sent to the image generator' }), el('p', { text: it.prompt })]),
    el('div', { class: 'row' }, [extra,
      el('button', { text: 'Save note', onclick: function () { post('/api/extra', { id: it.id, extra: extra.value }); } }),
      el('button', { class: 'primary', text: busy ? 'Generating…' : 'Generate ' + count() + ' more', disabled: busy, onclick: function () { post('/api/generate', { ids: [it.id], count: count() }); } })
    ]),
    strip,
    animation(it)
  ])]);
}

function render() {
  if (!S) return;
  renderLora();
  var c = document.getElementById('comfy');
  c.className = 'pill ' + (S.comfy.ok ? 'ok' : 'bad');
  c.textContent = S.comfy.ok ? 'Image generator ready: ' + (S.comfy.gpu || 'connected') + ' · ' + S.comfy.checkpoint : 'Image generator not available';
  var err = document.getElementById('error'), msg = S.job.error || (S.comfy.ok ? '' : S.comfy.error);
  err.style.display = msg ? 'block' : 'none'; err.textContent = msg || '';
  var game = S.items.filter(function (i) { return i.kind !== 'refs'; });
  document.getElementById('progress').textContent = game.filter(function (i) { return i.confirmed; }).length + ' of ' + game.length + ' confirmed · ' + game.filter(function (i) { return i.chosen; }).length + ' have an image';
  var j = document.getElementById('job'), busy = S.job.running;
  j.style.display = busy ? '' : 'none';
  j.textContent = busy ? (S.job.kind === 'clip' ? 'Animating ' : S.job.kind === 'variations' ? 'Making variations of ' : 'Generating ') + busy + ' · ' + duration(S.job.seconds) + (S.job.queued ? ' · ' + S.job.queued + ' waiting' : '') : '';
  var a = document.getElementById('animate');
  a.className = 'pill ' + (S.animate.ready ? 'ok' : '');
  a.textContent = S.animate.ready ? 'Animation workflow ready' : 'No animation workflow';
  a.title = S.animate.ready ? S.animate.workflow : 'Save one from ComfyUI as ' + S.animate.workflow + ' (AI guide, section 10)';
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
      var sig = JSON.stringify([it.chosen, it.picked, it.confirmed, it.candidates, it.extra, S.job.running === it.id && S.job.kind, it.inSet,
        it.clips, it.clip, it.motion, it.animating, it.canAnimate, S.animate.ready]);
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
