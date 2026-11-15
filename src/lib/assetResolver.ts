import { content } from '@/data';
import type { Expression } from '@/types';

/**
 * Turns logical ids into image URLs.
 *
 * Renders are DROP-IN: save a file under src/assets with the right name and it
 * is picked up automatically (dev server reloads; builds bundle and hash it).
 *
 *   src/assets/shots/<shotId>.webp                       full-frame shots
 *   src/assets/backgrounds/<backgroundId>.webp           backgrounds
 *   src/assets/cg/<cgId>.webp                            gallery illustrations
 *   src/assets/characters/<id>/<pose>/<expression>.webp  transparent sprites
 *
 * .webp, .avif, .jpg, .jpeg and .png are accepted. An explicit `src` on a
 * definition wins over a discovered file. With neither, the resolver returns
 * null and the renderer draws the placeholder.
 */
const discovered = import.meta.glob<string>('/src/assets/{shots,backgrounds,cg,characters}/**/*.{webp,avif,jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** "shots/c1_ferry_establish" → URL (extension stripped; first match wins). */
const byKey = new Map<string, string>();
for (const [path, url] of Object.entries(discovered)) {
  const key = path.replace('/src/assets/', '').replace(/\.[a-z0-9]+$/i, '');
  if (!byKey.has(key)) byKey.set(key, url);
}

export const discoveredAssetCount = byKey.size;

export function backgroundSrc(id: string): string | null {
  return content.backgrounds[id]?.src ?? byKey.get(`backgrounds/${id}`) ?? null;
}

export function cgSrc(id: string): string | null {
  return content.cgs[id]?.src ?? byKey.get(`cg/${id}`) ?? null;
}

export function shotSrc(id: string): string | null {
  return content.shots[id]?.src ?? byKey.get(`shots/${id}`) ?? null;
}

export function spriteSrc(character: string, pose: string, expression: Expression): string | null {
  const art = content.characterArt[character];
  if (!art) return null;
  const override = art.sprites?.[`${pose}/${expression}`];
  if (override) return override;
  const found = byKey.get(`characters/${character}/${pose}/${expression}`);
  if (found) return found;
  if (!art.basePath) return null;
  return `${art.basePath}/${pose}/${expression}.${art.extension ?? 'webp'}`;
}

/** Warm the browser cache for a list of URLs (used before scene changes). */
export function preload(urls: (string | null)[]) {
  for (const u of urls) {
    if (!u) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = u;
  }
}
