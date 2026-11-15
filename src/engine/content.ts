import type {
  AudioDefinition,
  BackgroundDefinition,
  CgDefinition,
  ChapterDefinition,
  CharacterDefinition,
  SceneDefinition,
} from '@/types';

/** Everything the engine needs from the content layer. Pure data. */
export interface GameContent {
  characters: Record<string, CharacterDefinition>;
  scenes: Record<string, SceneDefinition>;
  chapters: ChapterDefinition[];
  backgrounds: Record<string, BackgroundDefinition>;
  cgs: Record<string, CgDefinition>;
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
