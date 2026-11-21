import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import sharp from 'sharp';
import type { RenderItem } from '../../src/production/prompts';
import { ROOT } from './config';

/**
 * Where generated images live.
 *   render-candidates/<kind>/<id>/NN-s<seed>.png   every variant (not in git)
 *   src/assets/shots|cg/<id>.png                   the chosen one: the game shows this
 *   art-refs/<character>.png                       the chosen reference portrait
 *   render-overrides.json                          your per-image additions to the prompt
 *   render-candidates/<kind>/<id>/clips/NN-s<seed>.mp4   every animated clip
 *   src/assets/shots|cg/<id>.mp4 or <id>.once.mp4  the chosen clip (loops / plays once)
 */
export const CANDIDATES = join(ROOT, 'render-candidates');
const OVERRIDES = join(ROOT, 'render-overrides.json');
const IMAGE = /\.(png|webp|avif|jpe?g)$/i;

export const candidateDir = (item: RenderItem) => join(CANDIDATES, item.kind, item.id);

export function chosenDir(item: RenderItem): string {
  return item.kind === 'refs' ? join(ROOT, 'art-refs') : join(ROOT, 'src', 'assets', item.kind);
}
const chosenName = (item: RenderItem) => (item.kind === 'refs' ? item.id.replace(/^ref_/, '') : item.id);

/** Path of the chosen image for this item, whatever its extension, or null. */
export function chosenFile(item: RenderItem): string | null {
  const dir = chosenDir(item);
  if (!existsSync(dir)) return null;
  const f = readdirSync(dir).find((x) => IMAGE.test(x) && x.replace(IMAGE, '') === chosenName(item));
  return f ? join(dir, f) : null;
}

export function listCandidates(item: RenderItem): string[] {
  const dir = candidateDir(item);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => IMAGE.test(f))
    .sort()
    .map((f) => join(dir, f));
}

/** Saves a generated image as the next numbered candidate; shots and illustrations are sized to 1920×1080. */
export async function saveCandidate(item: RenderItem, png: Buffer, seed: number): Promise<string> {
  const dir = candidateDir(item);
  mkdirSync(dir, { recursive: true });
  const n = listCandidates(item).length + 1;
  const path = join(dir, `${String(n).padStart(2, '0')}-s${seed}.png`);
  const out = item.kind === 'refs' ? png : await sharp(png).resize(1920, 1080, { fit: 'cover', kernel: 'lanczos3' }).png().toBuffer();
  writeFileSync(path, out);
  return path;
}

/**
 * Makes a candidate the image the game uses (replacing any earlier choice).
 * `confirmed` is true when a person picked it, false when it was installed
 * automatically as the first variant.
 */
export function useCandidate(item: RenderItem, candidatePath: string, confirmed = false): string {
  const dir = chosenDir(item);
  mkdirSync(dir, { recursive: true });
  const previous = chosenFile(item);
  if (previous) rmSync(previous);
  const target = join(dir, `${chosenName(item)}.png`);
  copyFileSync(candidatePath, target);
  const picks = loadPicks();
  picks[item.id] = { file: basename(candidatePath), confirmed };
  mkdirSync(CANDIDATES, { recursive: true });
  writeFileSync(PICKS, JSON.stringify(picks, null, 2) + '\n');
  return target;
}

const PICKS = join(CANDIDATES, 'chosen.json');

export interface Pick {
  file: string;
  confirmed: boolean;
}

/** Which candidate file is currently the chosen one, per image, and whether a person confirmed it. */
export function loadPicks(): Record<string, Pick> {
  if (!existsSync(PICKS)) return {};
  try {
    return JSON.parse(readFileSync(PICKS, 'utf8')) as Record<string, Pick>;
  } catch {
    return {};
  }
}

export interface Override {
  /** Added to the end of the generated prompt for this image. */
  extra?: string;
  /** The movement to ask for when animating this image. */
  motion?: string;
}

export function loadOverrides(): Record<string, Override> {
  if (!existsSync(OVERRIDES)) return {};
  try {
    return JSON.parse(readFileSync(OVERRIDES, 'utf8')) as Record<string, Override>;
  } catch {
    return {};
  }
}

/** Updates the given fields of one image's notes; empty fields are removed. */
export function saveOverride(id: string, patch: Override): void {
  const all = loadOverrides();
  const next: Override = { ...all[id] };
  for (const key of ['extra', 'motion'] as const) {
    if (!(key in patch)) continue;
    const v = patch[key]?.trim();
    if (v) next[key] = v;
    else delete next[key];
  }
  if (Object.keys(next).length) all[id] = next;
  else delete all[id];
  writeFileSync(OVERRIDES, JSON.stringify(all, null, 2) + '\n');
}

// --- Clips -------------------------------------------------------------------

const CLIP = /\.(mp4|webm)$/i;
export type ClipMode = 'loop' | 'once';

export const clipDir = (item: RenderItem) => join(candidateDir(item), 'clips');

export function listClips(item: RenderItem): string[] {
  const dir = clipDir(item);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => CLIP.test(f)).sort().map((f) => join(dir, f));
}

export function saveClip(item: RenderItem, data: Buffer, ext: string, seed: number): string {
  const dir = clipDir(item);
  mkdirSync(dir, { recursive: true });
  const n = listClips(item).length + 1;
  const path = join(dir, `${String(n).padStart(2, '0')}-s${seed}.${ext}`);
  writeFileSync(path, data);
  return path;
}

/** The clip the game plays for this image, if any: `<id>.mp4` loops, `<id>.once.mp4` plays once. */
export function gameClip(item: RenderItem): { path: string; mode: ClipMode } | null {
  const dir = chosenDir(item);
  if (item.kind === 'refs' || !existsSync(dir)) return null;
  for (const f of readdirSync(dir)) {
    if (!CLIP.test(f)) continue;
    const base = f.replace(CLIP, '');
    if (base === item.id) return { path: join(dir, f), mode: 'loop' };
    if (base === `${item.id}.once`) return { path: join(dir, f), mode: 'once' };
  }
  return null;
}

const CLIP_PICKS = join(CANDIDATES, 'clips.json');

export function loadClipPicks(): Record<string, string> {
  if (!existsSync(CLIP_PICKS)) return {};
  try {
    return JSON.parse(readFileSync(CLIP_PICKS, 'utf8')) as Record<string, string>;
  } catch {
    return {};
  }
}

/** Puts a clip in the game next to the still, replacing any earlier clip for it. */
export function useClip(item: RenderItem, clipPath: string, mode: ClipMode): string {
  removeGameClip(item);
  const ext = clipPath.split('.').pop()!.toLowerCase();
  const dir = chosenDir(item);
  mkdirSync(dir, { recursive: true });
  const target = join(dir, `${item.id}${mode === 'once' ? '.once' : ''}.${ext}`);
  copyFileSync(clipPath, target);
  const picks = loadClipPicks();
  picks[item.id] = basename(clipPath);
  mkdirSync(CANDIDATES, { recursive: true });
  writeFileSync(CLIP_PICKS, JSON.stringify(picks, null, 2) + '\n');
  return target;
}

/** Takes the clip out of the game; the still is shown again. Candidates are kept. */
export function removeGameClip(item: RenderItem): void {
  for (;;) {
    const current = gameClip(item);
    if (!current) break;
    rmSync(current.path);
  }
  const picks = loadClipPicks();
  if (picks[item.id]) {
    delete picks[item.id];
    writeFileSync(CLIP_PICKS, JSON.stringify(picks, null, 2) + '\n');
  }
}
