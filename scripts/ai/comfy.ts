import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, isAbsolute, join } from 'node:path';
import { findClip, prepareAnimateWorkflow, type OutputFile } from '../../src/production/animateWorkflow';
import { ROOT, type AiConfig } from './config';

/**
 * Minimal client for a local ComfyUI server: queue one image, wait for it,
 * download it. Uses ComfyUI's standard HTTP API (/prompt, /history, /view).
 */

export interface GenerateRequest {
  positive: string;
  negative: string;
  seed: number;
  width: number;
  height: number;
  loras: { file: string; strength: number }[];
}

type Workflow = Record<string, { class_type: string; inputs: Record<string, unknown> }>;
type Link = [string, number];

export class ComfyError extends Error {}

async function call(cfg: AiConfig, path: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(cfg.comfyUrl.replace(/\/$/, '') + path, init);
  } catch {
    throw new ComfyError(
      `Cannot reach ComfyUI at ${cfg.comfyUrl}. Start it first (run_nvidia_gpu.bat) and wait until its window says it is listening.`,
    );
  }
}

/** Connection check: returns the graphics card ComfyUI is using and the model files it can see. */
export async function inspectComfy(cfg: AiConfig): Promise<{ gpu: string | null; checkpoints: string[] }> {
  let gpu: string | null = null;
  const stats = await call(cfg, '/system_stats');
  if (stats.ok) {
    const j = (await stats.json()) as { devices?: { name?: string; vram_total?: number }[] };
    const d = j.devices?.[0];
    if (d?.name) gpu = `${d.name}${d.vram_total ? ` (${(d.vram_total / 1024 ** 3).toFixed(0)} GB)` : ''}`;
  }
  let checkpoints: string[] = [];
  const info = await call(cfg, '/object_info/CheckpointLoaderSimple');
  if (info.ok) {
    const j = (await info.json()) as Record<string, { input?: { required?: { ckpt_name?: unknown[] } } }>;
    const spec = j.CheckpointLoaderSimple?.input?.required?.ckpt_name;
    // Older servers: [[names...]]. Newer servers: ["COMBO", { options: [names...] }].
    const first = spec?.[0];
    if (Array.isArray(first)) checkpoints = first as string[];
    else {
      const options = (spec?.[1] as { options?: string[] } | undefined)?.options;
      if (Array.isArray(options)) checkpoints = options;
    }
  }
  return { gpu, checkpoints };
}

/** Picks the model file to use, with a clear message when it cannot. */
export function resolveCheckpoint(cfg: AiConfig, available: string[]): string {
  if (cfg.checkpoint) {
    if (available.length && !available.includes(cfg.checkpoint)) {
      throw new ComfyError(
        `The model "${cfg.checkpoint}" in ai-render.config.json is not in ComfyUI/models/checkpoints. Found: ${available.join(', ') || 'none'}.`,
      );
    }
    return cfg.checkpoint;
  }
  if (available.length === 1) return available[0]!;
  if (available.length === 0) {
    throw new ComfyError('ComfyUI has no model installed. Put a .safetensors model file in ComfyUI/models/checkpoints and restart it.');
  }
  throw new ComfyError(
    `ComfyUI has several models. Set "checkpoint" in ai-render.config.json to one of: ${available.join(', ')}.`,
  );
}

function builtInWorkflow(cfg: AiConfig, checkpoint: string, r: GenerateRequest): Workflow {
  const wf: Workflow = { '4': { class_type: 'CheckpointLoaderSimple', inputs: { ckpt_name: checkpoint } } };
  let model: Link = ['4', 0];
  let clip: Link = ['4', 1];
  r.loras.forEach((l, i) => {
    const id = String(20 + i);
    wf[id] = {
      class_type: 'LoraLoader',
      inputs: { lora_name: l.file, strength_model: l.strength, strength_clip: l.strength, model, clip },
    };
    model = [id, 0];
    clip = [id, 1];
  });
  wf['5'] = { class_type: 'EmptyLatentImage', inputs: { width: r.width, height: r.height, batch_size: 1 } };
  wf['6'] = { class_type: 'CLIPTextEncode', inputs: { text: r.positive, clip } };
  wf['7'] = { class_type: 'CLIPTextEncode', inputs: { text: r.negative, clip } };
  const sampler = { cfg: cfg.cfg, sampler_name: cfg.sampler, scheduler: cfg.scheduler, model, positive: ['6', 0], negative: ['7', 0] };
  wf['3'] = { class_type: 'KSampler', inputs: { ...sampler, seed: r.seed, steps: cfg.steps, denoise: 1, latent_image: ['5', 0] } };
  let samples: Link = ['3', 0];
  if (cfg.hires) {
    // Second pass: enlarge the latent to full size and refine it.
    wf['10'] = {
      class_type: 'LatentUpscale',
      inputs: { samples, upscale_method: 'bislerp', width: 1920, height: 1088, crop: 'disabled' },
    };
    wf['11'] = {
      class_type: 'KSampler',
      inputs: { ...sampler, seed: r.seed, steps: Math.ceil(cfg.steps * 0.6), denoise: cfg.hiresDenoise, latent_image: ['10', 0] },
    };
    samples = ['11', 0];
  }
  wf['8'] = { class_type: 'VAEDecode', inputs: { samples, vae: ['4', 2] } };
  wf['9'] = { class_type: 'SaveImage', inputs: { filename_prefix: 'halcyon', images: ['8', 0] } };
  return wf;
}

/** Fills a user-supplied workflow (exported from ComfyUI in API format) with this request's values. */
function templateWorkflow(cfg: AiConfig, checkpoint: string, r: GenerateRequest): Workflow {
  const path = isAbsolute(cfg.workflow) ? cfg.workflow : join(ROOT, cfg.workflow);
  const esc = (s: string) => JSON.stringify(s).slice(1, -1);
  const text = readFileSync(path, 'utf8')
    .replaceAll('"%SEED%"', String(r.seed))
    .replaceAll('"%WIDTH%"', String(r.width))
    .replaceAll('"%HEIGHT%"', String(r.height))
    .replaceAll('"%STEPS%"', String(cfg.steps))
    .replaceAll('"%CFG%"', String(cfg.cfg))
    .replaceAll('%POSITIVE%', esc(r.positive))
    .replaceAll('%NEGATIVE%', esc(r.negative))
    .replaceAll('%CHECKPOINT%', esc(checkpoint));
  return JSON.parse(text) as Workflow;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Queues a workflow and waits until ComfyUI has finished it. Returns its history entry. */
async function runWorkflow(cfg: AiConfig, workflow: unknown, timeoutSeconds: number, what: string): Promise<HistoryEntry> {
  const queued = await call(cfg, '/prompt', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: workflow, client_id: 'halcyon' }),
  });
  const queuedBody = (await queued.json().catch(() => ({}))) as {
    prompt_id?: string;
    error?: { message?: string };
    node_errors?: Record<string, { class_type?: string; errors?: { message?: string; details?: string }[] }>;
  };
  if (!queued.ok || !queuedBody.prompt_id) {
    const details = Object.values(queuedBody.node_errors ?? {})
      .flatMap((n) => (n.errors ?? []).map((e) => ({ ...e, node: n.class_type })))
      .map((e) => [e.node, e.message, e.details].filter(Boolean).join(': '))
      .join('; ');
    throw new ComfyError(`ComfyUI rejected the request: ${queuedBody.error?.message ?? queued.statusText}${details ? ` (${details})` : ''}`);
  }

  const id = queuedBody.prompt_id;
  const deadline = Date.now() + timeoutSeconds * 1000;
  for (;;) {
    if (Date.now() > deadline) throw new ComfyError(`Timed out after ${timeoutSeconds} s waiting for ComfyUI.`);
    await sleep(700);
    const res = await call(cfg, `/history/${id}`);
    if (!res.ok) continue;
    const entry = ((await res.json()) as Record<string, HistoryEntry>)[id];
    if (!entry) continue; // still queued or running
    if (entry.status?.status_str === 'error') {
      const log = saveErrorLog(id, workflow, entry);
      throw new ComfyError(
        `ComfyUI failed while generating ${what}: ${describeFailure(entry)}\n` +
          `The full error report is in ${log}. The black ComfyUI window also shows it in red.`,
      );
    }
    if (entry.status?.completed || entry.status?.status_str === 'success') return entry;
    // Some versions list outputs before marking the job complete.
    if (Object.keys(entry.outputs ?? {}).length) return entry;
  }
}

async function download(cfg: AiConfig, f: OutputFile): Promise<Buffer> {
  const q = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder ?? '', type: f.type ?? 'output' });
  const file = await call(cfg, `/view?${q}`);
  if (!file.ok) throw new ComfyError(`Could not download ${f.filename} from ComfyUI (${file.status}).`);
  return Buffer.from(await file.arrayBuffer());
}

/** Generates one image and returns it as PNG bytes, exactly as ComfyUI produced it. */
export async function generateImage(cfg: AiConfig, checkpoint: string, r: GenerateRequest): Promise<Buffer> {
  const workflow = cfg.workflow ? templateWorkflow(cfg, checkpoint, r) : builtInWorkflow(cfg, checkpoint, r);
  const entry = await runWorkflow(cfg, workflow, cfg.timeoutSeconds, 'the image');
  const image = Object.values(entry.outputs ?? {}).flatMap((o) => (o.images as OutputFile[] | undefined) ?? [])[0];
  if (!image) throw new ComfyError('ComfyUI finished but returned no image.');
  return download(cfg, image);
}

// --- Animation -------------------------------------------------------------

/** Where the animation workflow is, and whether it exists. */
export function animateWorkflowPath(cfg: AiConfig): { path: string; exists: boolean } {
  const path = isAbsolute(cfg.animateWorkflow) ? cfg.animateWorkflow : join(ROOT, cfg.animateWorkflow);
  return { path, exists: Boolean(cfg.animateWorkflow) && existsSync(path) };
}

/** Sends a still to ComfyUI's input folder. Returns the name to put in a Load Image box. */
export async function uploadImage(cfg: AiConfig, path: string): Promise<string> {
  const form = new FormData();
  const ext = path.split('.').pop()!.toLowerCase();
  const type = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
  form.append('image', new Blob([readFileSync(path)], { type }), `halcyon_${basename(path)}`);
  form.append('overwrite', 'true');
  const res = await call(cfg, '/upload/image', { method: 'POST', body: form });
  const body = (await res.json().catch(() => ({}))) as { name?: string; subfolder?: string };
  if (!res.ok || !body.name) throw new ComfyError(`ComfyUI did not accept the still (${res.status}).`);
  return body.subfolder ? `${body.subfolder}/${body.name}` : body.name;
}

/**
 * Animates one still with the user's image-to-video workflow. Returns the
 * clip's bytes and its extension (mp4 or webm).
 */
export async function animateImage(
  cfg: AiConfig,
  r: { imagePath: string; prompt: string; negative: string; seed: number },
): Promise<{ data: Buffer; ext: 'mp4' | 'webm' }> {
  const wfPath = animateWorkflowPath(cfg);
  if (!wfPath.exists) {
    throw new ComfyError(`No animation workflow yet. Save one from ComfyUI as ${cfg.animateWorkflow} (see section 10 of the AI guide).`);
  }
  const image = await uploadImage(cfg, r.imagePath);
  let workflow;
  try {
    workflow = prepareAnimateWorkflow(readFileSync(wfPath.path, 'utf8'), { image, prompt: r.prompt, negative: r.negative, seed: r.seed });
  } catch (e) {
    throw new ComfyError((e as Error).message);
  }
  const entry = await runWorkflow(cfg, workflow, cfg.animateTimeoutSeconds, 'the clip');
  const { clip, other } = findClip((entry.outputs ?? {}) as Record<string, Record<string, unknown>>);
  if (!clip) {
    throw new ComfyError(
      other.length
        ? `The workflow saved ${other.join(', ')} but no MP4. Change its last box to Save Video with format "mp4" (or Video Combine with "video/h264-mp4"), save it again, and retry.`
        : 'ComfyUI finished but the workflow saved no video. Check that it ends with a Save Video box.',
    );
  }
  return { data: await download(cfg, clip), ext: /\.webm$/i.test(clip.filename) ? 'webm' : 'mp4' };
}

interface HistoryEntry {
  outputs?: Record<string, Record<string, unknown>>;
  status?: { status_str?: string; completed?: boolean; messages?: unknown[] };
}

interface ErrorDetail {
  exception_message?: string;
  exception_type?: string;
  node_type?: string;
  node_id?: string;
  message?: string;
  error?: string | { message?: string };
}

/**
 * Pulls a readable reason out of a failed history entry. ComfyUI has reported
 * errors in slightly different shapes across versions, so this looks at every
 * message rather than assuming one format.
 */
export function describeFailure(entry: HistoryEntry): string {
  const found: string[] = [];
  for (const m of entry.status?.messages ?? []) {
    // Usually [type, data]; sometimes { type, data } or the data object itself.
    let type = '';
    let data: unknown = m;
    if (Array.isArray(m)) [type, data] = [String(m[0] ?? ''), m[1]];
    else if (m && typeof m === 'object' && 'type' in m) {
      type = String((m as { type: unknown }).type);
      data = (m as { data?: unknown }).data ?? m;
    }
    if (!/error|interrupt/i.test(type) && !(data && typeof data === 'object' && 'exception_message' in data)) continue;
    const d = (data ?? {}) as ErrorDetail;
    const text =
      d.exception_message ?? d.message ?? (typeof d.error === 'string' ? d.error : d.error?.message) ?? (type.includes('interrupt') ? 'interrupted' : '');
    const where = d.node_type ? ` (in ${d.node_type}${d.node_id ? ` #${d.node_id}` : ''})` : '';
    const kind = d.exception_type ? `${d.exception_type}: ` : '';
    if (text || kind) found.push(`${kind}${String(text).trim()}${where}`);
  }
  if (found.length) return found.join('; ');
  const raw = JSON.stringify(entry.status ?? {});
  return `no error message was included. Status: ${raw.length > 300 ? raw.slice(0, 300) + '…' : raw}`;
}

/** Writes everything about a failed job to a file the user can send, and returns its path. */
function saveErrorLog(id: string, workflow: unknown, entry: HistoryEntry): string {
  const dir = join(ROOT, 'render-candidates');
  const path = join(dir, 'last-error.json');
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(path, JSON.stringify({ prompt_id: id, when: new Date().toISOString(), status: entry.status, workflow }, null, 2));
  } catch {
    // Logging must never hide the real error.
  }
  return 'render-candidates\\last-error.json';
}
