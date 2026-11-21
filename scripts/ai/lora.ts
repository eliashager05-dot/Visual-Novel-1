/**
 * Character LoRA training sets: the pictures you picked for each character,
 * extra varied pictures to pick from, and the training folder built from them.
 *
 *   render-candidates/lora/<character>/NN-vK-s<seed>.png   generated variations
 *   render-candidates/lora-sets.json                       which pictures are in each set
 *   lora-datasets/<character>/                             the training folder (built on request)
 *
 * Command line:  npm run lora -- --character noor   (builds the training folder)
 *                npm run lora -- --character noor --variations 6
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, join, relative, sep } from 'node:path';
import sharp from 'sharp';
import { content } from '../../src/data';
import {
  datasetFolderName, GOOD_IMAGES, isSoloOf, itemCaption, loraCharacters, loraTrigger, MIN_IMAGES, trainingConfig,
  variationCaption, variationPrompt,
} from '../../src/production/lora';
import { listRenderItems } from '../../src/production/prompts';
import { ComfyError, generateImage } from './comfy';
import { ROOT, type AiConfig } from './config';
import type { Session } from './run';
import { CANDIDATES } from './store';

const SETS = join(CANDIDATES, 'lora-sets.json');
export const DATASETS = join(ROOT, 'lora-datasets');
const IMAGE = /\.(png|webp|jpe?g)$/i;

export const variationDir = (charId: string) => join(CANDIDATES, 'lora', charId);
/** Paths in the set file are relative to the game folder, with forward slashes, so they work on any computer. */
const rel = (abs: string) => relative(ROOT, abs).split(sep).join('/');
const abs = (r: string) => join(ROOT, ...r.split('/'));

export function assertCharacter(charId: string): void {
  if (!loraCharacters().includes(charId)) {
    throw new ComfyError(`Unknown character "${charId}". Use one of: ${loraCharacters().join(', ')}.`);
  }
}

// --- Variations ----------------------------------------------------------------

export function listVariations(charId: string): string[] {
  const dir = variationDir(charId);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => IMAGE.test(f)).sort().map((f) => join(dir, f));
}

/** The variation number is in the file name: "03-v2-s1234.png" is variation 2. */
const variationIndex = (file: string) => Number(/-v(\d+)-/.exec(basename(file))?.[1] ?? 0);

/**
 * Generates `count` new varied pictures of a character (angles, moods, outfits,
 * places), continuing after the ones already made. If the character already has
 * a LoRA set up, it is used, so a second round comes out more consistent.
 */
export async function generateVariations(session: Session, charId: string, count: number): Promise<string[]> {
  assertCharacter(charId);
  const { cfg, checkpoint } = session;
  const dir = variationDir(charId);
  mkdirSync(dir, { recursive: true });
  const existing = listVariations(charId);
  const start = existing.length ? Math.max(...existing.map(variationIndex)) + 1 : 0;
  const lora = cfg.loras[charId];
  const out: string[] = [];
  for (let k = 0; k < count; k++) {
    const n = start + k;
    const p = variationPrompt(charId, n, cfg.style || undefined);
    const positive = lora?.file ? `${lora.trigger || loraTrigger(charId)}, ${p.positive}` : p.positive;
    const png = await generateImage(cfg, checkpoint, {
      positive,
      negative: [p.negative, cfg.negative].filter(Boolean).join(', '),
      seed: p.seed,
      width: 896,
      height: 1152,
      loras: lora?.file ? [{ file: lora.file, strength: lora.strength ?? 0.8 }] : [],
    });
    const path = join(dir, `${String(existing.length + k + 1).padStart(2, '0')}-v${n}-s${p.seed}.png`);
    writeFileSync(path, png);
    out.push(path);
  }
  return out;
}

// --- The training set ------------------------------------------------------------

function loadSets(): Record<string, string[]> {
  if (!existsSync(SETS)) return {};
  try {
    return JSON.parse(readFileSync(SETS, 'utf8')) as Record<string, string[]>;
  } catch {
    return {};
  }
}

/** Pictures in a character's set that still exist, as paths relative to the game folder. */
export function trainingSet(charId: string): string[] {
  return (loadSets()[charId] ?? []).filter((r) => existsSync(abs(r)));
}

/** Pictures that may go in a character's set: their variations, and candidates of images that show only them. */
export function allowedInSet(charId: string, absPath: string): boolean {
  const r = rel(absPath);
  if (r.startsWith(`render-candidates/lora/${charId}/`)) return true;
  const m = /^render-candidates\/(shots|cg|refs)\/([^/]+)\/[^/]+$/.exec(r);
  if (!m) return false;
  const item = listRenderItems().find((i) => i.kind === m[1] && i.id === m[2]);
  return Boolean(item && isSoloOf(item, charId));
}

export function setInTrainingSet(charId: string, absPath: string, on: boolean): void {
  assertCharacter(charId);
  if (!existsSync(absPath) || !IMAGE.test(absPath)) throw new ComfyError('That picture does not exist.');
  if (!allowedInSet(charId, absPath)) throw new ComfyError('Only pictures that show this character alone can go in the training set.');
  const sets = loadSets();
  const list = new Set(sets[charId] ?? []);
  if (on) list.add(rel(absPath));
  else list.delete(rel(absPath));
  sets[charId] = [...list].sort();
  mkdirSync(CANDIDATES, { recursive: true });
  writeFileSync(SETS, JSON.stringify(sets, null, 2) + '\n');
}

/** The caption for a picture in the set, from where it came from. */
export function captionForPath(charId: string, relPath: string): string {
  if (relPath.startsWith(`render-candidates/lora/${charId}/`)) return variationCaption(charId, variationIndex(relPath));
  const m = /^render-candidates\/(shots|cg|refs)\/([^/]+)\//.exec(relPath);
  const item = m ? listRenderItems().find((i) => i.kind === m[1] && i.id === m[2]) : undefined;
  return item ? itemCaption(item, charId) : `${loraTrigger(charId)}`;
}

// --- The training folder -----------------------------------------------------------

export interface BuildResult {
  dir: string;
  images: number;
  warning: string | null;
}

/**
 * Writes lora-datasets/<character>/: the pictures with a caption file each, in
 * the folder layout the training tools expect, plus train.toml and README.txt.
 * Rebuilding replaces the pictures (your trained LoRAs in output/ are kept).
 */
export async function buildDataset(cfg: AiConfig, charId: string): Promise<BuildResult> {
  assertCharacter(charId);
  const set = trainingSet(charId);
  if (set.length < MIN_IMAGES) {
    throw new ComfyError(`${set.length} pictures in ${charName(charId)}'s training set. Pick at least ${MIN_IMAGES} (about ${GOOD_IMAGES} is better).`);
  }
  const base = join(DATASETS, charId);
  const imgRoot = join(base, 'img');
  rmSync(imgRoot, { recursive: true, force: true });
  const folder = join(imgRoot, datasetFolderName(charId, set.length));
  mkdirSync(folder, { recursive: true });
  mkdirSync(join(base, 'output'), { recursive: true });

  let i = 0;
  for (const r of set) {
    i++;
    const name = String(i).padStart(3, '0');
    // Big enough for training, small enough to keep the folder light.
    await sharp(abs(r)).resize(1536, 1536, { fit: 'inside', withoutEnlargement: true }).png().toFile(join(folder, `${name}.png`));
    writeFileSync(join(folder, `${name}.txt`), captionForPath(charId, r) + '\n');
  }

  const checkpoint = cfg.trainingCheckpoint || `C:\\path\\to\\ComfyUI\\models\\checkpoints\\${cfg.checkpoint || 'your-model.safetensors'}`;
  writeFileSync(join(base, 'train.toml'), trainingConfig({ charId, checkpoint, imageDir: imgRoot, outputDir: join(base, 'output') }));
  writeFileSync(join(base, 'README.txt'), readme(cfg, charId, set.length));
  return {
    dir: base,
    images: set.length,
    warning: set.length < GOOD_IMAGES ? `Only ${set.length} pictures: it will work, but about ${GOOD_IMAGES} gives a more reliable likeness.` : null,
  };
}

const charName = (id: string) => content.characters[id]?.shortName ?? content.characters[id]?.name ?? id;

function readme(cfg: AiConfig, charId: string, count: number): string {
  const trigger = loraTrigger(charId);
  return [
    `Training folder for ${charName(charId)} (${count} pictures). Full guide: docs/LORA_GUIDE.md`,
    '',
    `Trigger word: ${trigger}`,
    '',
    '1. Check train.toml: the first line must point to your model file.',
    cfg.trainingCheckpoint ? '   (It does: it uses trainingCheckpoint from ai-render.config.json.)' : '   Set "trainingCheckpoint" in ai-render.config.json and build again, or edit the line by hand.',
    '2. In the sd-scripts folder (kohya), with its environment active, run:',
    `   accelerate launch sdxl_train_network.py --config_file "${join(DATASETS, charId, 'train.toml')}"`,
    '   (Or use the kohya_ss window with the settings table in docs/LORA_GUIDE.md.)',
    `3. When it finishes, copy output\\${charId}.safetensors to ComfyUI\\models\\loras\\`,
    `4. In ai-render.config.json add:  "loras": { "${charId}": { "file": "${charId}.safetensors", "strength": 0.8 } }`,
    `   The trigger word ${trigger} is then added to ${charName(charId)}'s prompts automatically.`,
    '',
  ].join('\r\n');
}

// --- Command line ----------------------------------------------------------------

if (process.argv[1] && /lora\.ts$/.test(process.argv[1])) {
  const { loadConfig } = await import('./config');
  const { openSession } = await import('./run');
  const arg = (name: string) => {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const charId = arg('character');
  try {
    if (!charId) throw new ComfyError(`Say which character: npm run lora -- --character <${loraCharacters().join('|')}>`);
    const cfg = loadConfig();
    const n = Number(arg('variations') ?? 0);
    if (n > 0) {
      const session = await openSession(cfg);
      const made = await generateVariations(session, charId, n);
      console.log(`Made ${made.length} variations in ${relative(ROOT, variationDir(charId))}. Pick the good ones in the render studio.`);
    } else {
      const r = await buildDataset(cfg, charId);
      console.log(`Training folder ready: ${r.dir} (${r.images} pictures). Next steps: README.txt in that folder.`);
      if (r.warning) console.log(r.warning);
    }
  } catch (e) {
    console.error((e as Error).message);
    process.exitCode = 1;
  }
}
