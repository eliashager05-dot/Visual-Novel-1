/**
 * Prepares an image-to-video workflow for one clip.
 *
 * The workflow is the user's own: any ComfyUI video template (Wan, LTX-Video,
 * …) that ran once in ComfyUI and was saved with "Export (API)". Rather than
 * asking the user to edit that file, we find the parts to fill in:
 *
 *   - the Load Image box gets the still being animated,
 *   - the text box wired to a "positive" input gets the motion prompt,
 *   - every "seed" / "noise_seed" number gets a new seed, so each run differs.
 *
 * Placeholders still work for unusual workflows and take precedence:
 * %IMAGE%, %PROMPT% (or %POSITIVE%), %NEGATIVE%, "%SEED%".
 *
 * Pure: no files, no network. The render studio does the uploading.
 */

export type Workflow = Record<string, { class_type: string; inputs: Record<string, unknown>; _meta?: unknown }>;

export interface AnimateValues {
  /** Name ComfyUI gave the uploaded still. */
  image: string;
  prompt: string;
  negative: string;
  seed: number;
}

export class WorkflowError extends Error {}

const isLink = (v: unknown): v is [string, number] => Array.isArray(v) && v.length === 2 && typeof v[0] === 'string' && typeof v[1] === 'number';

/** Node ids whose output feeds an input with one of these names, anywhere in the graph. */
function nodesFeeding(wf: Workflow, inputNames: string[]): Set<string> {
  const out = new Set<string>();
  for (const node of Object.values(wf)) {
    for (const [name, value] of Object.entries(node.inputs ?? {})) {
      if (inputNames.includes(name) && isLink(value)) out.add(value[0]);
    }
  }
  return out;
}

/** The text field of a prompt box: `text` for the standard box, `prompt` for some model-specific ones. */
function textField(node: Workflow[string]): string | null {
  if (typeof node.inputs.text === 'string') return 'text';
  if (typeof node.inputs.prompt === 'string') return 'prompt';
  return null;
}

export function prepareAnimateWorkflow(source: string, v: AnimateValues): Workflow {
  const esc = (s: string) => JSON.stringify(s).slice(1, -1);
  const has = (p: string) => source.includes(p);
  const usesImage = has('%IMAGE%');
  const usesPrompt = has('%PROMPT%') || has('%POSITIVE%');
  const usesSeed = has('"%SEED%"');

  let wf: Workflow;
  try {
    wf = JSON.parse(
      source
        .replaceAll('"%SEED%"', String(v.seed))
        .replaceAll('%IMAGE%', esc(v.image))
        .replaceAll('%PROMPT%', esc(v.prompt))
        .replaceAll('%POSITIVE%', esc(v.prompt))
        .replaceAll('%NEGATIVE%', esc(v.negative)),
    ) as Workflow;
  } catch {
    throw new WorkflowError('The animation workflow is not valid JSON. Save it again from ComfyUI with "Export (API)".');
  }
  const nodes = Object.entries(wf ?? {});
  if (!nodes.length || nodes.some(([, n]) => !n || typeof n.class_type !== 'string' || typeof n.inputs !== 'object')) {
    throw new WorkflowError(
      'The animation workflow is not in API format. In ComfyUI use Workflow → Export (API), not the normal Save.',
    );
  }

  if (!usesImage) {
    const loaders = nodes.filter(([, n]) => n.class_type === 'LoadImage');
    if (loaders.length === 0) throw new WorkflowError('The animation workflow has no Load Image box. Use an image-to-video template.');
    if (loaders.length > 1) {
      throw new WorkflowError('The animation workflow has several Load Image boxes. Put %IMAGE% in the one for the still.');
    }
    loaders[0]![1].inputs.image = v.image;
  }

  if (!usesPrompt) {
    const positive = [...nodesFeeding(wf, ['positive'])].filter((id) => wf[id] && textField(wf[id]!));
    // A conditioning node can sit between the text box and the sampler: follow one step back.
    if (!positive.length) {
      for (const id of nodesFeeding(wf, ['positive'])) {
        for (const value of Object.values(wf[id]?.inputs ?? {})) {
          if (isLink(value) && wf[value[0]] && textField(wf[value[0]]!)) positive.push(value[0]);
        }
      }
    }
    if (!positive.length) {
      throw new WorkflowError('Could not find the prompt box in the animation workflow. Put %PROMPT% in its text.');
    }
    for (const id of new Set(positive)) wf[id]!.inputs[textField(wf[id]!)!] = v.prompt;
  }

  if (!usesSeed) {
    for (const [, n] of nodes) {
      for (const key of ['seed', 'noise_seed']) if (typeof n.inputs[key] === 'number') n.inputs[key] = v.seed;
    }
  }
  return wf;
}

export interface OutputFile {
  filename: string;
  subfolder?: string;
  type?: string;
}

const VIDEO = /\.(mp4|webm)$/i;

/**
 * Picks the clip from a finished job's outputs. Video nodes report their
 * files under different keys ("images", "gifs", "videos", …), so every list
 * is searched. Returns null when the job saved no MP4 or WebM, with the
 * names it did save, to explain what to change.
 */
export function findClip(outputs: Record<string, Record<string, unknown>>): { clip: OutputFile | null; other: string[] } {
  const files: OutputFile[] = [];
  for (const out of Object.values(outputs ?? {})) {
    for (const list of Object.values(out ?? {})) {
      if (!Array.isArray(list)) continue;
      for (const f of list) if (f && typeof f === 'object' && typeof (f as OutputFile).filename === 'string') files.push(f as OutputFile);
    }
  }
  const clip = files.find((f) => /\.mp4$/i.test(f.filename)) ?? files.find((f) => VIDEO.test(f.filename)) ?? null;
  return { clip, other: files.filter((f) => !VIDEO.test(f.filename)).map((f) => f.filename) };
}

const DEFAULT_MOTION =
  'Subtle, natural movement: breathing, a blink, hair and clothes stirring slightly in the air, a slow gentle camera push-in';

/** The prompt for a clip: the movement first (what the video model must add), then the scene as context. */
export function motionPrompt(brief: string, motion?: string): string {
  return `${(motion?.trim() || DEFAULT_MOTION).replace(/\.$/, '')}. ${brief} Photorealistic, cinematic, smooth and slow motion, stable faces.`;
}

export const MOTION_NEGATIVE =
  'static, frozen, jitter, flicker, morphing, distorted face, deformed hands, extra fingers, extra limbs, fast motion, text, watermark, cartoon';
