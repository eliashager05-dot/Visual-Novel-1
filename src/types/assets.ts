/**
 * Asset manifest types. Story content references assets by logical id only;
 * the manifest maps ids to files. Swapping placeholder art for final renders
 * means editing the manifest (or dropping files in place) — never the story.
 */

/** Procedural placeholder description used until a real render exists. */
export interface PlaceholderArt {
  /** Gradient stops from top to bottom (sky → ground). */
  palette: [string, string, string];
  /** Hint for the placeholder painter: what kind of scene to suggest. */
  motif?: 'interior' | 'exterior' | 'night' | 'water' | 'bar' | 'room';
}

export interface BackgroundDefinition {
  id: string;
  name: string;
  /** URL of the final render (1920×1080 WebP/AVIF recommended). */
  src?: string;
  placeholder: PlaceholderArt;
}

export interface CgDefinition {
  id: string;
  title: string;
  src?: string;
  /** Characters featured, used for gallery filtering. */
  characters: string[];
  placeholder: PlaceholderArt;
}

export interface AudioDefinition {
  id: string;
  title: string;
  src?: string;
}
