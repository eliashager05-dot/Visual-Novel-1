import type { ChoiceHint, Effect, EngineEvent, GameState, PresentedChoice } from '@/types';
import { evaluateCondition } from './conditions';
import { applyEffects } from './effects';
import type { CompiledOption, Instruction } from './sceneCompiler';
import { interpolate } from './text';

type ChoiceInstruction = Extract<Instruction, { type: 'choice' }>;

/**
 * Evaluates option conditions. Options whose condition fails are hidden,
 * unless flagged `showWhenLocked`, in which case they appear disabled — useful
 * to signal "you could have said something else here" without spoilers.
 */
export function presentChoice(instr: ChoiceInstruction, state: GameState): PresentedChoice {
  const options = instr.options
    .map((o) => {
      const enabled = !o.condition || evaluateCondition(o.condition, state);
      if (!enabled && !o.showWhenLocked) return null;
      const hints = hintsFor(o.effects ?? [], state);
      return {
        id: o.id,
        text: interpolate(o.text, state),
        enabled,
        ...(enabled || !o.lockedHint ? {} : { lockedHint: o.lockedHint }),
        ...(hints.length ? { hints } : {}),
        ...(o.place ? { place: o.place } : {}),
      };
    })
    .filter((o): o is NonNullable<typeof o> => o !== null);

  return {
    choiceId: instr.id,
    prompt: instr.prompt ? interpolate(instr.prompt, state) : undefined,
    options,
    timeout: instr.timeout,
    ...(instr.map ? { map: instr.map } : {}),
  };
}

/** Sums an option's relationship effects per character and stat. */
export function hintsFor(effects: Effect[], state: GameState): ChoiceHint[] {
  const out: ChoiceHint[] = [];
  const find = (character: string, stat: ChoiceHint['stat']) => out.find((h) => h.character === character && h.stat === stat);
  for (const e of effects) {
    if (e.type !== 'affinity' && e.type !== 'trust' && e.type !== 'milestone') continue;
    const known = state.relationships[e.character]?.met ?? false;
    if (e.type === 'milestone') {
      if (!find(e.character, 'milestone')) out.push({ character: e.character, stat: 'milestone', known });
      continue;
    }
    const h = find(e.character, e.type);
    if (h) h.delta = (h.delta ?? 0) + e.delta;
    else out.push({ character: e.character, stat: e.type, delta: e.delta, known });
  }
  return out.filter((h) => h.stat === 'milestone' || h.delta !== 0);
}

/**
 * Validates and applies a pick to a draft state. Returns the instruction index
 * to continue from.
 */
export function resolveChoice(
  instr: ChoiceInstruction,
  optionId: string,
  state: GameState,
  events: EngineEvent[],
): number {
  const option: CompiledOption | undefined = instr.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`Choice "${instr.id}" has no option "${optionId}"`);
  if (option.condition && !evaluateCondition(option.condition, state)) {
    throw new Error(`Option "${optionId}" of choice "${instr.id}" is locked`);
  }
  state.choicesMade[instr.id] = option.id;
  state.history.push({
    kind: 'choice',
    speaker: 'player',
    speakerName: state.player.name,
    text: interpolate(option.text, state),
  });
  if (option.effects) applyEffects(state, option.effects, events);
  return option.target;
}
