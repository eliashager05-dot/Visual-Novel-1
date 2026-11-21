/**
 * Turns the list of files in src/assets into lookups by logical id.
 * Pure (no Vite, no DOM) so the naming rules can be unit-tested.
 *
 *   shots/<id>.webp            still image      (also .avif .jpg .jpeg .png)
 *   shots/<id>.mp4             looping clip     (also .webm)
 *   shots/<id>.once.mp4        clip that plays once and holds its last frame
 *   music/<id>.ogg             music track      (also .mp3 .wav .m4a .opus)
 *   sounds/<id>.mp3            sound effect     (same formats)
 */

export const IMAGE_EXT = /\.(webp|avif|jpe?g|png)$/i;
export const VIDEO_EXT = /\.(mp4|webm)$/i;
export const AUDIO_EXT = /\.(ogg|mp3|wav|m4a|opus)$/i;

export interface VideoAsset {
  url: string;
  /** false for "<id>.once.mp4": play once, then hold the last frame. */
  loop: boolean;
}

export interface AssetIndex {
  images: Map<string, string>;
  videos: Map<string, VideoAsset>;
  /** "music/<id>" and "sounds/<id>" → URL. */
  audio: Map<string, string>;
}

/** `files` maps a path like "/src/assets/shots/c1_x.png" to its served URL. */
export function indexAssets(files: Record<string, string>): AssetIndex {
  const images = new Map<string, string>();
  const videos = new Map<string, VideoAsset>();
  const audio = new Map<string, string>();
  // Sorted so that duplicates resolve the same way on every machine.
  for (const path of Object.keys(files).sort()) {
    const url = files[path]!;
    const rel = path.replace(/^.*?\/src\/assets\//, '');
    if (IMAGE_EXT.test(rel)) {
      const key = rel.replace(IMAGE_EXT, '');
      if (!images.has(key)) images.set(key, url);
    } else if (VIDEO_EXT.test(rel)) {
      const base = rel.replace(VIDEO_EXT, '');
      const once = /\.once$/i.test(base);
      const key = once ? base.replace(/\.once$/i, '') : base;
      if (!videos.has(key)) videos.set(key, { url, loop: !once });
    } else if (AUDIO_EXT.test(rel)) {
      const key = rel.replace(AUDIO_EXT, '');
      if (!audio.has(key)) audio.set(key, url);
    }
  }
  return { images, videos, audio };
}

/** The logical id a video file belongs to ("c1_x.once.mp4" → "c1_x"), or null if it is not a video. */
export function videoId(fileName: string): string | null {
  if (!VIDEO_EXT.test(fileName)) return null;
  return fileName.replace(VIDEO_EXT, '').replace(/\.once$/i, '');
}
