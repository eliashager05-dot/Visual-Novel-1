import type {
  CharacterDefinition,
  GameState,
  ProfileEntry,
  RelationshipState,
  RelationshipTier,
} from '@/types';
import { evaluateCondition } from './conditions';

export const STAT_MIN = 0;
export const STAT_MAX = 100;

export const DEFAULT_TIERS: RelationshipTier[] = [
  { min: 0, label: 'Stranger' },
  { min: 15, label: 'Acquaintance' },
  { min: 35, label: 'Friendly' },
  { min: 55, label: 'Close' },
  { min: 75, label: 'Devoted' },
];

export const clampStat = (n: number) => Math.max(STAT_MIN, Math.min(STAT_MAX, Math.round(n)));

export function createRelationship(def: CharacterDefinition): RelationshipState {
  return {
    affinity: clampStat(def.initialRelationship.affinity),
    trust: clampStat(def.initialRelationship.trust),
    met: false,
    milestones: [],
  };
}

/**
 * Mutates `state` (callers pass a draft). Returns the delta actually applied
 * after clamping, so the UI can show honest feedback.
 */
export function adjustStat(
  state: GameState,
  character: string,
  stat: 'affinity' | 'trust',
  delta: number,
): number {
  const rel = state.relationships[character];
  if (!rel) throw new Error(`Unknown character "${character}" in relationship change`);
  const before = rel[stat];
  rel[stat] = clampStat(before + delta);
  return rel[stat] - before;
}

export function addMilestone(state: GameState, character: string, milestone: string): boolean {
  const rel = state.relationships[character];
  if (!rel) throw new Error(`Unknown character "${character}" in milestone`);
  if (rel.milestones.includes(milestone)) return false;
  rel.milestones.push(milestone);
  return true;
}

export function getTier(def: CharacterDefinition, affinity: number): RelationshipTier {
  const tiers = def.tiers ?? DEFAULT_TIERS;
  let current = tiers[0] ?? { min: 0, label: '' };
  for (const t of tiers) if (affinity >= t.min) current = t;
  return current;
}

/** Profile entries the player has earned the right to see. */
export function visibleProfile(def: CharacterDefinition, state: GameState): ProfileEntry[] {
  return def.profile.filter((e) => !e.unlockWhen || evaluateCondition(e.unlockWhen, state));
}

/** Whether the character appears in the relationship menu at all. */
export function isRevealed(def: CharacterDefinition, state: GameState): boolean {
  if (def.revealWhen) return evaluateCondition(def.revealWhen, state);
  return state.relationships[def.id]?.met ?? false;
}
