/**
 * Checks the renders you have dropped into src/assets. Run with `npm run renders`.
 *
 *   npm run renders                 check names, sizes and progress
 *   npm run renders -- --optimize   also convert to 1920×1080 WebP; originals are MOVED to render-masters/
 */
import { existsSync, mkdirSync, readdirSync, renameSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { VIDEO_EXT, videoId } from '../src/lib/assetIndex';
import { content } from '../src/data';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const ASSETS = join(ROOT, 'src', 'assets');
const MASTERS = join(ROOT, 'render-masters');
const EXT = /\.(webp|avif|jpe?g|png)$/i;
const optimize = process.argv.includes('--optimize');
const BIG = 1.5 * 1024 * 1024;

const folders: { folder: string; label: string; ids: string[] }[] = [
  { folder: 'shots', label: 'shots', ids: Object.keys(content.shots) },
  { folder: 'cg', label: 'illustrations', ids: Object.keys(content.cgs) },
  { folder: 'backgrounds', label: 'backgrounds', ids: Object.keys(content.backgrounds) },
];

/** Edit distance, for "did you mean…?" on misnamed files. */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length]![b.length]!;
}

const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`;
let errors = 0;
let warnings = 0;
let converted = 0;
let saved = 0;

for (const { folder, label, ids } of folders) {
  const dir = join(ASSETS, folder);
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => EXT.test(f)) : [];
  const seen = new Map<string, string>();
  console.log(`\n${label.toUpperCase()} — ${files.length} file${files.length === 1 ? '' : 's'} in src/assets/${folder}`);

  for (const file of files) {
    const id = file.replace(EXT, '');
    const path = join(dir, file);
    const problems: string[] = [];

    if (!ids.includes(id)) {
      const guess = ids.map((x) => [x, distance(x, id)] as const).sort((a, b) => a[1] - b[1])[0];
      problems.push(`ERROR  not a known ${label.replace(/s$/, '')} name${guess && guess[1] <= 6 ? ` — did you mean "${guess[0]}"?` : ''}`);
      errors++;
    }
    if (seen.has(id)) {
      problems.push(`ERROR  duplicate of ${seen.get(id)} (keep only one file per name)`);
      errors++;
    }
    seen.set(id, file);

    let width = 0;
    let height = 0;
    try {
      const meta = await sharp(path).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
    } catch {
      problems.push('ERROR  not a readable image');
      errors++;
    }
    if (width && height) {
      const ratio = width / height;
      if (Math.abs(ratio - 16 / 9) > 0.02) {
        problems.push(`ERROR  ${width}×${height} is not 16:9 — the game would crop it. Render at 1920×1080 or 2560×1440.`);
        errors++;
      } else if (width < 1920) {
        problems.push(`WARN   ${width}×${height} is below 1920×1080 and will look soft`);
        warnings++;
      }
    }
    const size = statSync(path).size;
    const isWebp = /\.webp$/i.test(file);
    const needsOptimizing = size > BIG || width > 1920 || !isWebp;
    if (!optimize && size > BIG) {
      problems.push(`WARN   ${mb(size)} is large — run "npm run renders -- --optimize"`);
      warnings++;
    }

    if (optimize && needsOptimizing && problems.every((x) => !x.startsWith('ERROR'))) {
      const target = join(dir, `${id}.webp`);
      const tmp = join(dir, `${id}.tmp.webp`);
      await sharp(path).resize(1920, 1080, { fit: 'cover' }).webp({ quality: 88 }).toFile(tmp);
      mkdirSync(join(MASTERS, folder), { recursive: true });
      renameSync(path, join(MASTERS, folder, file)); // keep the original, out of the game
      renameSync(tmp, target);
      const newSize = statSync(target).size;
      saved += size - newSize;
      converted++;
      console.log(`  ${id}: converted ${mb(size)} → ${mb(newSize)} (original moved to render-masters/${folder}/)`);
      continue;
    }
    console.log(problems.length ? `  ${file}\n    ${problems.join('\n    ')}` : `  ${file}  ok (${width}×${height}, ${mb(size)})`);
  }

  const have = new Set([...seen.keys()].filter((id) => ids.includes(id)));
  console.log(`  → ${have.size} of ${ids.length} ${label} delivered`);

  // Animated clips: <id>.mp4 / .webm loop, <id>.once.mp4 plays once.
  const clips = existsSync(dir) ? readdirSync(dir).filter((f) => VIDEO_EXT.test(f)) : [];
  const clipIds = new Map<string, string>();
  for (const file of clips) {
    const id = videoId(file)!;
    const size = statSync(join(dir, file)).size;
    const notes: string[] = [];
    if (!ids.includes(id)) {
      const guess = ids.map((x) => [x, distance(x, id)] as const).sort((a, b) => a[1] - b[1])[0];
      notes.push(`ERROR  not a known ${label.replace(/s$/, '')} name${guess && guess[1] <= 6 ? ` — did you mean "${guess[0]}"?` : ''}`);
      errors++;
    }
    if (clipIds.has(id)) {
      notes.push(`ERROR  a second clip for "${id}" (also ${clipIds.get(id)}) — keep only one`);
      errors++;
    }
    clipIds.set(id, file);
    if (ids.includes(id) && !seen.has(id)) {
      notes.push('WARN   no still image with the same name — add one so there is no blank frame before the clip starts');
      warnings++;
    }
    if (size > 40 * 1024 * 1024) {
      notes.push(`WARN   ${mb(size)} is large for a short clip`);
      warnings++;
    }
    const mode = /\.once\.[a-z0-9]+$/i.test(file) ? 'plays once' : 'loops';
    console.log(notes.length ? `  ${file}\n    ${notes.join('\n    ')}` : `  ${file}  ok (clip, ${mode}, ${mb(size)})`);
  }
  if (clips.length) console.log(`  → ${[...clipIds.keys()].filter((id) => ids.includes(id)).length} animated`);
}

console.log(
  `\n${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}` +
    (optimize ? `, ${converted} converted, ${mb(saved)} saved` : '') +
    '.',
);
if (errors) process.exitCode = 1;
