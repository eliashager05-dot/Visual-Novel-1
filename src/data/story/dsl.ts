/**
 * Authoring helpers. Scene files are plain data, but writing raw objects for
 * every line is noisy. These helpers produce exactly the same `Step` objects
 * (so JSON-authored scenes remain fully supported) while reading like a script:
 *
 *   const vera = speaker('vera');
 *   scene('c1_lobby', 'ch1', 'The Lobby', [
 *     bg('hotel_lobby_evening'),
 *     show('vera', { position: 'right', expression: 'neutral' }),
 *     vera("You're late.", 'angry'),
 *     choice('c1_lobby_reply', [
 *       option('apologise', 'Apologise.', { effects: [affinity('vera', 3)] }),
 *       option('joke', 'Blame the ferry.', { steps: [vera('The ferry was on time.')] }),
 *     ]),
 *     end(),
 *   ]);
 */
import type {
  ChoiceOption,
  Comparison,
  Condition,
  Effect,
  Expression,
  JumpTarget,
  SceneDefinition,
  SpriteTransition,
  StagePosition,
  Step,
  TransitionKind,
} from '@/types';

export const scene = (
  id: string,
  chapter: string,
  title: string,
  steps: Step[],
  opts: { replayable?: boolean } = {},
): SceneDefinition => ({ id, chapter, title, steps, ...opts });

// --- Lines --------------------------------------------------------------
export const narrate = (text: string): Step => ({ type: 'narrate', text });
export const think = (text: string): Step => ({ type: 'think', text });
export const me = (text: string): Step => ({ type: 'say', speaker: 'player', text });
export const say = (speaker: string, text: string, expression?: Expression, pose?: string): Step => ({
  type: 'say',
  speaker,
  text,
  ...(expression ? { expression } : {}),
  ...(pose ? { pose } : {}),
});

/** Bind a speaker once per file: `const noor = speaker('noor'); noor('Hi!', 'happy')`. */
export const speaker =
  (id: string) =>
  (text: string, expression?: Expression, opts: { pose?: string; as?: string } = {}): Step => ({
    type: 'say',
    speaker: id,
    text,
    ...(expression ? { expression } : {}),
    ...(opts.pose ? { pose: opts.pose } : {}),
    ...(opts.as ? { as: opts.as } : {}),
  });

// --- Staging ------------------------------------------------------------
export const bg = (id: string, transition: TransitionKind = 'dissolve'): Step => ({ type: 'background', id, transition });
export const show = (
  character: string,
  opts: { position?: StagePosition; expression?: Expression; pose?: string; transition?: SpriteTransition } = {},
): Step => ({ type: 'show', character, ...opts });
export const hide = (character: string | '*' = '*', transition?: SpriteTransition): Step => ({
  type: 'hide',
  character,
  ...(transition ? { transition } : {}),
});
export const expr = (character: string, expression: Expression, pose?: string): Step => ({
  type: 'expression',
  character,
  expression,
  ...(pose ? { pose } : {}),
});
export const move = (character: string, position: StagePosition): Step => ({ type: 'move', character, position });
export const cg = (id: string | null): Step => ({ type: 'cg', id });
export const transition = (kind: TransitionKind, duration?: number): Step => ({ type: 'transition', kind, duration });
export const music = (track: string | null, fade?: number): Step => ({ type: 'music', track, fade });
export const sfx = (id: string): Step => ({ type: 'sfx', id });
export const title = (t: string, subtitle?: string): Step => ({ type: 'title', title: t, subtitle });

// --- Flow ---------------------------------------------------------------
export const label = (name: string): Step => ({ type: 'label', name });
export const jump = (sceneOrLabel: JumpTarget | string): Step => ({
  type: 'jump',
  target: typeof sceneOrLabel === 'string' ? { scene: sceneOrLabel } : sceneOrLabel,
});
export const when = (condition: Condition, then: Step[], otherwise?: Step[]): Step => ({
  type: 'if',
  condition,
  then,
  ...(otherwise ? { else: otherwise } : {}),
});
export const choice = (id: string, options: ChoiceOption[], prompt?: string): Step => ({
  type: 'choice',
  id,
  options,
  ...(prompt ? { prompt } : {}),
});
export const option = (id: string, text: string, rest: Omit<ChoiceOption, 'id' | 'text'> = {}): ChoiceOption => ({
  id,
  text,
  ...rest,
});
export const end = (opts: { ending?: string; nextChapter?: string } = {}): Step => ({ type: 'end', ...opts });
export const effects = (...list: Effect[]): Step => ({ type: 'effects', effects: list });
export const unlock = (gallery: string): Step => ({ type: 'unlock', gallery });

// --- Effects ------------------------------------------------------------
export const affinity = (character: string, delta: number): Effect => ({ type: 'affinity', character, delta });
export const trust = (character: string, delta: number): Effect => ({ type: 'trust', character, delta });
export const setFlag = (flag: string, value = true): Effect => ({ type: 'flag', flag, value });
export const setVar = (name: string, value: number | string | boolean): Effect => ({ type: 'var', name, op: 'set', value });
export const addVar = (name: string, value: number): Effect => ({ type: 'var', name, op: 'add', value });
export const milestone = (character: string, id: string): Effect => ({ type: 'milestone', character, milestone: id });

// --- Conditions ---------------------------------------------------------
export const C = {
  affinity: (character: string, cmp: Comparison): Condition => ({ type: 'affinity', character, ...cmp }),
  trust: (character: string, cmp: Comparison): Condition => ({ type: 'trust', character, ...cmp }),
  variable: (name: string, cmp: Comparison): Condition => ({ type: 'var', name, ...cmp }),
  flag: (flag: string, value = true): Condition => ({ type: 'flag', flag, value }),
  milestone: (character: string, id: string): Condition => ({ type: 'milestone', character, milestone: id }),
  chose: (choiceId: string, optionId: string): Condition => ({ type: 'chose', choice: choiceId, option: optionId }),
  visited: (sceneId: string): Condition => ({ type: 'visited', scene: sceneId }),
  met: (character: string): Condition => ({ type: 'met', character }),
  all: (...conditions: Condition[]): Condition => ({ type: 'all', conditions }),
  any: (...conditions: Condition[]): Condition => ({ type: 'any', conditions }),
  not: (condition: Condition): Condition => ({ type: 'not', condition }),
};
