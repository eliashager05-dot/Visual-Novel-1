import type { Condition, GameState } from '@/types';
import { evaluateCondition } from './conditions';

/**
 * Achievements. Pure: given the current playthrough and the player's lasting
 * progress, which achievements are now earned. Persisting them and showing a
 * notice is the store's and UI's job.
 */

/** What an achievement needs. */
export type AchievementRule =
  /** True in the current playthrough. */
  | { kind: 'condition'; condition: Condition }
  /** Every listed scene seen, in any playthroughs. */
  | { kind: 'scenesSeen'; scenes: string[] }
  /** The chapter's end reached at least once. */
  | { kind: 'chapterComplete'; chapter: string };

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  /** Hidden achievements show "???" until earned, so they cannot spoil the story. */
  hidden?: boolean;
  rule: AchievementRule;
}

/** Lasting progress the rules can read (kept across playthroughs). */
export interface ProgressSnapshot {
  scenesSeen: Record<string, true>;
  chaptersCompleted: Record<string, true>;
}

export function isEarned(def: AchievementDefinition, state: GameState | null, progress: ProgressSnapshot): boolean {
  const r = def.rule;
  switch (r.kind) {
    case 'condition':
      return state !== null && evaluateCondition(r.condition, state);
    case 'scenesSeen':
      return r.scenes.every((s) => progress.scenesSeen[s] || state?.visitedScenes.includes(s));
    case 'chapterComplete':
      return Boolean(progress.chaptersCompleted[r.chapter]);
  }
}

/** Achievements earned now that were not already unlocked. */
export function newlyEarned(
  defs: AchievementDefinition[],
  unlocked: Record<string, unknown>,
  state: GameState | null,
  progress: ProgressSnapshot,
): AchievementDefinition[] {
  return defs.filter((d) => !unlocked[d.id] && isEarned(d, state, progress));
}
