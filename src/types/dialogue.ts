import type { CharacterId, Expression } from './character';

/** The line currently on screen. */
export interface DisplayedLine {
  kind: 'narrate' | 'think' | 'say';
  speaker: CharacterId | 'player' | null;
  /** Resolved name for the name plate (null for narration). */
  speakerName: string | null;
  text: string;
  expression?: Expression;
  /** Stable key for read-tracking (skip-read mode). */
  key: string;
}

/** A choice option as presented to the player (condition already evaluated). */
export interface PresentedOption {
  id: string;
  text: string;
  enabled: boolean;
  lockedHint?: string;
}

export interface PresentedChoice {
  choiceId: string;
  prompt?: string;
  options: PresentedOption[];
  timeout?: { seconds: number; defaultOption: string };
}

export interface HistoryEntry {
  kind: 'narrate' | 'think' | 'say' | 'choice';
  speakerName: string | null;
  speaker: CharacterId | 'player' | null;
  text: string;
}
