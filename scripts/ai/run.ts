import { milestones } from '../../src/data/renderSheets';
import { buildPrompt, listRenderItems, type BuiltPrompt, type RenderItem } from '../../src/production/prompts';
import { MOTION_NEGATIVE, motionPrompt } from '../../src/production/animateWorkflow';
import { animateImage, ComfyError, generateImage, inspectComfy, resolveCheckpoint } from './comfy';
import type { AiConfig } from './config';
import { chosenFile, listCandidates, listClips, loadOverrides, saveCandidate, saveClip, useCandidate } from './store';

export interface Session {
  cfg: AiConfig;
  checkpoint: string;
  gpu: string | null;
}

/** Connects to ComfyUI and settles which model to use. Throws ComfyError with a plain-language reason. */
export async function openSession(cfg: AiConfig): Promise<Session> {
  const { gpu, checkpoints } = await inspectComfy(cfg);
  return { cfg, gpu, checkpoint: resolveCheckpoint(cfg, checkpoints) };
}

export function promptFor(cfg: AiConfig, item: RenderItem): BuiltPrompt {
  return buildPrompt(item, {
    style: cfg.style || undefined,
    negative: cfg.negative,
    extra: loadOverrides()[item.id]?.extra,
  });
}

/**
 * Generates `count` new variants of one image. Each variant gets its own seed,
 * continuing from the variants that already exist, so asking again always
 * gives new images. If the item has no chosen image yet, the first new variant
 * becomes the one the game shows.
 */
export async function generateVariants(
  session: Session,
  item: RenderItem,
  count: number,
  opts: { install?: boolean; onImage?: (path: string, n: number) => void } = {},
): Promise<string[]> {
  const { cfg, checkpoint } = session;
  const built = promptFor(cfg, item);
  const existing = listCandidates(item).length;
  const loras = item.characters
    .map((c) => cfg.loras[c])
    .filter((l): l is { file: string; strength?: number } => Boolean(l?.file))
    .map((l) => ({ file: l.file, strength: l.strength ?? 0.8 }));
  // Reference portraits are upright; everything else is 16:9.
  const size = item.kind === 'refs' ? { width: 896, height: 1152 } : { width: cfg.width, height: cfg.height };

  const paths: string[] = [];
  for (let k = 0; k < count; k++) {
    const seed = built.seed + existing + k;
    const png = await generateImage(cfg, checkpoint, { positive: built.positive, negative: built.negative, seed, loras, ...size });
    const path = await saveCandidate(item, png, seed);
    paths.push(path);
    opts.onImage?.(path, k + 1);
  }
  if (opts.install !== false && paths[0] && !chosenFile(item)) useCandidate(item, paths[0]);
  return paths;
}

/** The prompt a clip of this image is made with. */
export function clipPromptFor(item: RenderItem): string {
  return motionPrompt(item.brief, loadOverrides()[item.id]?.motion);
}

/**
 * Makes one new animated clip from the image chosen for this shot, with the
 * user's image-to-video workflow. Each clip gets a new seed. Returns its path.
 */
export async function animateClip(cfg: AiConfig, item: RenderItem): Promise<string> {
  if (item.kind === 'refs') throw new ComfyError('Reference portraits are not animated.');
  const still = chosenFile(item);
  if (!still) throw new ComfyError('Choose an image for this shot first; the clip is made from it.');
  const seed = buildPrompt(item).seed + 5000 + listClips(item).length;
  const { data, ext } = await animateImage(cfg, { imagePath: still, prompt: clipPromptFor(item), negative: MOTION_NEGATIVE, seed });
  return saveClip(item, data, ext, seed);
}

/** Items for a selection, in story order. Reference portraits only when asked for. */
export function selectItems(sel: { milestone?: number; scene?: string; ids?: string[]; all?: boolean; refs?: boolean }): RenderItem[] {
  const items = listRenderItems();
  if (sel.ids?.length) {
    const missing = sel.ids.filter((id) => !items.some((i) => i.id === id));
    if (missing.length) throw new ComfyError(`Unknown image name(s): ${missing.join(', ')}`);
    return items.filter((i) => sel.ids!.includes(i.id));
  }
  if (sel.refs) return items.filter((i) => i.kind === 'refs');
  if (sel.scene) return items.filter((i) => i.scene === sel.scene);
  if (sel.milestone) {
    const m = milestones[sel.milestone - 1];
    if (!m) throw new ComfyError(`There are ${milestones.length} milestones; ${sel.milestone} is not one of them.`);
    return items.filter((i) => i.scene && m.scenes.includes(i.scene));
  }
  if (sel.all) return items.filter((i) => i.kind !== 'refs');
  return [];
}
