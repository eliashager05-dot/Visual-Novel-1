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
  motif?: 'interior' | 'exterior' | 'night' | 'water' | 'bar' | 'room' | 'shore' | 'storm';
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

/** Camera framing for a shot — part of the render brief and used by the placeholder. */
export type CameraFraming = 'wide' | 'medium' | 'close' | 'extreme_close' | 'over_shoulder';

export interface ShotCharacter {
  id: string;
  pose?: string;
  expression?: import('./character').Expression;
  /** Horizontal placement in frame. */
  position?: import('./character').StagePosition;
  /** Which way the character faces in the render. */
  facing?: 'left' | 'right' | 'camera';
}

/**
 * A "shot" is a full-frame render with characters, camera and lighting baked
 * in — the primary presentation style of 3D-rendered visual novels. The
 * definition doubles as the brief for the render artist.
 */
export interface ShotDefinition {
  id: string;
  /** Location (for the placeholder and the brief's lighting reference). */
  background: string;
  camera: CameraFraming;
  characters: ShotCharacter[];
  /** What the artist should render: action, mood, lighting, props. */
  description: string;
  /** Final render URL (1920×1080). Absent → placeholder composite. */
  src?: string;
}

export type HairStyle = 'bun' | 'curls_scarf' | 'pixie' | 'bob' | 'bald_beard';

/** Look of the procedural stand-in sprite. Locked per character for consistency. */
export interface SilhouetteSpec {
  hair: HairStyle;
  hairColor: string;
  skin: string;
  outfit: string;
  outfitAccent: string;
  /** Relative height; 1 = average. Keeps the cast's proportions consistent. */
  height: number;
  /** Relative shoulder width; 1 = average. */
  build?: number;
}

/**
 * How a character is drawn. Final renders are found by convention:
 * `${basePath}/${pose}/${expression}.webp`, with optional per-sprite overrides.
 * If a file is missing or fails to load, the placeholder is drawn instead.
 */
export interface CharacterArt {
  character: string;
  basePath?: string;
  extension?: 'webp' | 'avif' | 'png';
  /** `pose/expression` → URL overrides. */
  sprites?: Record<string, string>;
  silhouette: SilhouetteSpec;
}
