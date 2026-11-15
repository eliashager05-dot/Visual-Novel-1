import type { Effect, EngineEvent, GameState } from '@/types';
import { addMilestone, adjustStat } from './relationshipEngine';

/** Applies effects to a draft state, pushing UI-facing events. */
export function applyEffects(state: GameState, effects: Effect[], events: EngineEvent[]): void {
  for (const e of effects) {
    switch (e.type) {
      case 'affinity':
      case 'trust': {
        const applied = adjustStat(state, e.character, e.type, e.delta);
        if (applied !== 0) {
          events.push({ type: 'relationshipChanged', character: e.character, stat: e.type, delta: applied });
        }
        break;
      }
      case 'flag':
        state.flags[e.flag] = e.value ?? true;
        break;
      case 'var': {
        if (e.op === 'set') {
          state.vars[e.name] = e.value;
        } else {
          const cur = state.vars[e.name];
          if (typeof e.value !== 'number') throw new Error(`var add on "${e.name}" needs a number`);
          state.vars[e.name] = (typeof cur === 'number' ? cur : 0) + e.value;
        }
        break;
      }
      case 'milestone':
        if (addMilestone(state, e.character, e.milestone)) {
          events.push({ type: 'milestone', character: e.character, milestone: e.milestone });
        }
        break;
    }
  }
}
