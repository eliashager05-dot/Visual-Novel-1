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
}

export function loadOverrides(): Record<string, Override> {
  if (!existsSync(OVERRIDES)) return {};
  try {
    return JSON.parse(readFileSync(OVERRIDES, 'utf8')) as Record<string, Override>;
  } catch {
    return {};
  }
}

export function saveOverride(id: string, o: Override): void {
  const all = loadOverrides();
  if (o.extra?.trim()) all[id] = { extra: o.extra.trim() };
  else delete all[id];
  writeFileSync(OVERRIDES, JSON.stringify(all, null, 2) + '\n');
}
