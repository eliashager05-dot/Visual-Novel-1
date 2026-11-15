import type { CharacterId, Expression, StagePosition } from './character';
import type { DisplayedLine, HistoryEntry, PresentedChoice } from './dialogue';
import type { TransitionKind } from './scene';

export interface StageCharacter {
  id: CharacterId;
  position: StagePosition;
  pose: string;
  expression: Expression;
}

/** Everything needed to redraw the screen exactly — stored in saves. */
export interface StageState {
  background: string | null;
  cg: string | null;
  shot: string | null;
  characters: StageCharacter[];
  music: string | null;
}

export interface RelationshipState {
  affinity: number;
  trust: number;
  met: boolean;
  milestones: string[];
}

export interface ProgramPointer {
  scene: string;
  index: number;
}

export type Presentation =
  | { kind: 'line'; line: DisplayedLine }
  | { kind: 'choice'; choice: PresentedChoice }
  | { kind: 'title'; title: string; subtitle?: string }
  | { kind: 'end'; ending?: string; nextChapter?: string }
  | { kind: 'idle' };

/**
 * The complete, serialisable state of one playthrough. Plain JSON — no class
 * instances, Sets or Maps — so it can be written to storage verbatim.
 */
export interface GameState {
  schemaVersion: number;
  player: { name: string };
  /** Points at the NEXT instruction to execute. */
  pointer: ProgramPointer;
  /** Call stack is unnecessary: scenes jump, they don't return. Kept flat on purpose. */
  stage: StageState;
  presentation: Presentation;
  relationships: Record<CharacterId, RelationshipState>;
  flags: Record<string, boolean>;
  vars: Record<string, number | string | boolean>;
  /** choiceId → optionId of the most recent pick. */
  choicesMade: Record<string, string>;
  visitedScenes: string[];
  history: HistoryEntry[];
  /** Monotonic counter of executed lines; useful for playtime/progress heuristics. */
  lineCount: number;
}

/** Side effects the engine asks the presentation layer to perform. */
export type EngineEvent =
  | { type: 'transition'; kind: TransitionKind; duration?: number }
  | { type: 'sfx'; id: string }
  | { type: 'music'; track: string | null; fade?: number }
  | { type: 'unlockGallery'; id: string }
  | { type: 'unlockScene'; id: string }
  | { type: 'characterMet'; character: CharacterId }
  | { type: 'ending'; id: string }
  | { type: 'relationshipChanged'; character: CharacterId; stat: 'affinity' | 'trust'; delta: number }
  | { type: 'milestone'; character: CharacterId; milestone: string };
