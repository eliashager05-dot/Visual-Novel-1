import type { Condition } from './scene';

/** Every expression the art pipeline is expected to deliver for a major character. */
export const EXPRESSIONS = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'surprised',
  'embarrassed',
  'flirty',
  'worried',
  'laughing',
] as const;
export type Expression = (typeof EXPRESSIONS)[number];

/** Stage slots a sprite can occupy. Kept abstract so the renderer owns actual layout. */
export type StagePosition = 'farLeft' | 'left' | 'center' | 'right' | 'farRight';

export type CharacterId = string;

/** A piece of profile info shown in the relationship menu once its condition is met. */
export interface ProfileEntry {
  id: string;
  label: string;
  text: string;
  /** Hidden until this condition is true. Omit for always-visible info. */
  unlockWhen?: Condition;
}

export interface MilestoneDefinition {
  id: string;
  title: string;
  /** Shown only after the milestone is reached — never leaks future story. */
  description: string;
}

/** Affinity thresholds → human-readable status. Must be sorted ascending by `min`. */
export interface RelationshipTier {
  min: number;
  label: string;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  /** Short name used in the dialogue name plate, e.g. a nickname. Defaults to `name`. */
  shortName?: string;
  /** Hard requirement: every character must be 21+. Enforced by the content validator. */
  age: number;
  /** 'protagonist' is the player character: staged in shots, but never a relationship. Its id must be 'player'. */
  role: 'major' | 'supporting' | 'protagonist';
  romanceable: boolean;
  /** Accent colour for name plate and UI highlights (CSS colour). */
  color: string;

  // --- Writer-facing bible (not all of this is shown to the player) ---
  occupation: string;
  appearance: string;
  personality: string;
  background: string;
  motivations: string[];
  strengths: string[];
  weaknesses: string[];
  dialogueStyle: string;
  /** Private notes on the character's arc. Never rendered in the game UI. */
  arcNotes?: string;

  // --- Runtime data ---
  initialRelationship: { affinity: number; trust: number };
  poses: string[];
  defaultPose: string;
  expressions: readonly Expression[];
  tiers?: RelationshipTier[];
  /** Player-facing profile, revealed progressively. */
  profile: ProfileEntry[];
  milestones: MilestoneDefinition[];
  /** When the character first appears in the relationship menu. Defaults to "has met". */
  revealWhen?: Condition;
}
