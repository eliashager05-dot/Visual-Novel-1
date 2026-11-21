import type { CharacterId, Expression } from './character';

/** The line currently on screen. */
export interface DisplayedLine {
  /** 'text' is a phone message, shown in the phone rather than as a subtitle. */
  kind: 'narrate' | 'think' | 'say' | 'text';
  speaker: CharacterId | 'player' | null;
  /** Resolved name for the name plate (null for narration). */
  speakerName: string | null;
  text: string;
  expression?: Expression;
  /** Stable key for read-tracking (skip-read mode). */
  key: string;
  /** For 'text': the conversation it belongs to. */
  thread?: string;
}

/** What an option does to a relationship, for walkthrough mode. */
export interface ChoiceHint {
  character: CharacterId;
  stat: 'affinity' | 'trust' | 'milestone';
  /** Summed change for affinity and trust; absent for milestones. */
  delta?: number;
  /** False if the player has not met this character yet (show "???"). */
  known: boolean;
}

/** A choice option as presented to the player (condition already evaluated). */
export interface PresentedOption {
  id: string;
  text: string;
  enabled: boolean;
  lockedHint?: string;
  /** Relationship consequences of picking it. Shown only when walkthrough mode is on. */
  hints?: ChoiceHint[];
}

export interface PresentedChoice {
  choiceId: string;
  prompt?: string;
  options: PresentedOption[];
  timeout?: { seconds: number; defaultOption: string };
}

export interface HistoryEntry {
  kind: 'narrate' | 'think' | 'say' | 'text' | 'choice';
  speakerName: string | null;
  speaker: CharacterId | 'player' | null;
  text: string;
}
