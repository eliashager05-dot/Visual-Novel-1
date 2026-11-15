import { content } from '@/data';
import type { Expression } from '@/types';

/**
 * Single place that turns logical ids into URLs. Returns `null` when no final
 * asset is configured, which tells the renderer to draw the placeholder.
 */
export function backgroundSrc(id: string): string | null {
  return content.backgrounds[id]?.src ?? null;
}

export function cgSrc(id: string): string | null {
  return content.cgs[id]?.src ?? null;
}

export function spriteSrc(character: string, pose: string, expression: Expression): string | null {
  const art = content.characterArt[character];
  if (!art) return null;
  const override = art.sprites?.[`${pose}/${expression}`];
  if (override) return override;
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
