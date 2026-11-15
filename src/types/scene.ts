import type { CharacterId, Expression, StagePosition } from './character';

// ---------------------------------------------------------------------------
// Conditions — a small, serialisable predicate language for branching.
// ---------------------------------------------------------------------------

export interface Comparison {
  gte?: number;
  gt?: number;
  lte?: number;
  lt?: number;
  eq?: number | string | boolean;
}

export type Condition =
  | ({ type: 'affinity'; character: CharacterId } & Comparison)
  | ({ type: 'trust'; character: CharacterId } & Comparison)
  | ({ type: 'var'; name: string } & Comparison)
  | { type: 'flag'; flag: string; value?: boolean }
  | { type: 'milestone'; character: CharacterId; milestone: string }
  | { type: 'chose'; choice: string; option: string }
  | { type: 'visited'; scene: string }
  | { type: 'met'; character: CharacterId }
  | { type: 'all'; conditions: Condition[] }
  | { type: 'any'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };

// ---------------------------------------------------------------------------
// Effects — state mutations triggered by choices or script steps.
// ---------------------------------------------------------------------------

export type Effect =
  | { type: 'affinity'; character: CharacterId; delta: number }
  | { type: 'trust'; character: CharacterId; delta: number }
  | { type: 'flag'; flag: string; value?: boolean }
  | { type: 'var'; name: string; op: 'set' | 'add'; value: number | string | boolean }
  | { type: 'milestone'; character: CharacterId; milestone: string };

// ---------------------------------------------------------------------------
// Steps — what writers author. Steps can nest (if / choice branches); the
// scene compiler flattens them into a linear instruction list.
// ---------------------------------------------------------------------------

export type TransitionKind = 'fade' | 'dissolve' | 'black' | 'white' | 'flash' | 'none';
export type SpriteTransition = 'fade' | 'slide' | 'none';

/** A jump target: another scene (from its start or a label) or a label in this scene. */
export interface JumpTarget {
  scene?: string;
  label?: string;
}

export interface ChoiceOption {
  /** Stable id used in save data and `chose` conditions. Required so saves survive edits. */
  id: string;
  text: string;
  /** Option only offered when the condition holds. */
  condition?: Condition;
  /** If true and the condition fails, show the option greyed out instead of hiding it. */
  showWhenLocked?: boolean;
  lockedHint?: string;
  effects?: Effect[];
  /** Inline branch steps, executed before continuing after the choice (or jumping). */
  steps?: Step[];
  /** Leave the current flow entirely. Applied after inline steps. */
  goto?: JumpTarget;
}

export type Step =
  | { type: 'narrate'; text: string }
  | { type: 'think'; text: string }
  | {
      type: 'say';
      speaker: CharacterId | 'player';
      text: string;
      expression?: Expression;
      pose?: string;
      /** Override name plate, e.g. "???" before a character introduces themselves. */
      as?: string;
    }
  | { type: 'background'; id: string; transition?: TransitionKind }
  | {
      type: 'show';
      character: CharacterId;
      position?: StagePosition;
      expression?: Expression;
      pose?: string;
      transition?: SpriteTransition;
    }
  | { type: 'hide'; character: CharacterId | '*'; transition?: SpriteTransition }
  | { type: 'expression'; character: CharacterId; expression: Expression; pose?: string }
  | { type: 'move'; character: CharacterId; position: StagePosition }
  | { type: 'cg'; id: string | null }
  | { type: 'transition'; kind: TransitionKind; duration?: number }
  | { type: 'music'; track: string | null; fade?: number }
  | { type: 'sfx'; id: string }
  | { type: 'effects'; effects: Effect[] }
  | { type: 'unlock'; gallery: string }
  | { type: 'title'; title: string; subtitle?: string }
  | { type: 'label'; name: string }
  | { type: 'jump'; target: JumpTarget }
  | { type: 'if'; condition: Condition; then: Step[]; else?: Step[] }
  | {
      type: 'choice';
      /** Stable choice id; recorded in `choicesMade`. */
      id: string;
      prompt?: string;
      options: ChoiceOption[];
      /** Seconds before the default option is taken — tension choices. Optional. */
      timeout?: { seconds: number; defaultOption: string };
    }
  | { type: 'end'; ending?: string; nextChapter?: string };

export interface SceneDefinition {
  id: string;
  chapter: string;
  /** Shown in save slots and scene gallery. */
  title: string;
  /** Unlocks the scene in the "Scenes" gallery for replay when reached. */
  replayable?: boolean;
  steps: Step[];
}

export interface ChapterDefinition {
  id: string;
  title: string;
  subtitle?: string;
  startScene: string;
}
