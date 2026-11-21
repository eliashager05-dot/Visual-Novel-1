import type {
  AudioDefinition,
  BackgroundDefinition,
  CgDefinition,
  CharacterArt,
  ChapterDefinition,
  ContactDefinition,
  CharacterDefinition,
  MapDefinition,
  SceneDefinition,
  ShotDefinition,
} from '@/types';

/** Everything the engine needs from the content layer. Pure data. */
export interface GameContent {
  characters: Record<string, CharacterDefinition>;
  /** Visual identity per character (renders or placeholder spec). */
  characterArt: Record<string, CharacterArt>;
  scenes: Record<string, SceneDefinition>;
  chapters: ChapterDefinition[];
  backgrounds: Record<string, BackgroundDefinition>;
  cgs: Record<string, CgDefinition>;
  shots: Record<string, ShotDefinition>;
  /** Phone contacts that are not characters. */
  contacts: Record<string, ContactDefinition>;
  /** Maps for map choices. */
  maps: Record<string, MapDefinition>;
  music: Record<string, AudioDefinition>;
  sfx: Record<string, AudioDefinition>;
  /** Default player name offered on new game. */
  defaultPlayerName: string;
}

/** Turns an array of definitions into an id-keyed record, rejecting duplicates. */
export function byId<T extends { id: string }>(items: T[], kind = 'item'): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of items) {
    if (out[item.id]) throw new Error(`Duplicate ${kind} id "${item.id}"`);
    out[item.id] = item;
  }
  return out;
}
