import type { Comparison, Condition, GameState } from '@/types';

export function compare(actual: number | string | boolean | undefined, c: Comparison): boolean {
  if (c.eq !== undefined && actual !== c.eq) return false;
  const hasNumeric = c.gte !== undefined || c.gt !== undefined || c.lte !== undefined || c.lt !== undefined;
  if (!hasNumeric) return c.eq !== undefined ? true : Boolean(actual);
  const n = typeof actual === 'number' ? actual : 0;
  if (c.gte !== undefined && !(n >= c.gte)) return false;
  if (c.gt !== undefined && !(n > c.gt)) return false;
  if (c.lte !== undefined && !(n <= c.lte)) return false;
  if (c.lt !== undefined && !(n < c.lt)) return false;
  return true;
}

export function evaluateCondition(cond: Condition, state: GameState): boolean {
  switch (cond.type) {
    case 'affinity':
      return compare(state.relationships[cond.character]?.affinity ?? 0, cond);
    case 'trust':
      return compare(state.relationships[cond.character]?.trust ?? 0, cond);
    case 'var':
      return compare(state.vars[cond.name], cond);
    case 'flag':
      return (state.flags[cond.flag] ?? false) === (cond.value ?? true);
    case 'milestone':
      return state.relationships[cond.character]?.milestones.includes(cond.milestone) ?? false;
    case 'chose':
      return state.choicesMade[cond.choice] === cond.option;
    case 'visited':
      return state.visitedScenes.includes(cond.scene);
    case 'met':
      return state.relationships[cond.character]?.met ?? false;
    case 'day':
      return compare(state.clock?.day ?? 0, cond);
    case 'time':
      return state.clock !== null && cond.periods.includes(state.clock.period);
    case 'all':
      return cond.conditions.every((c) => evaluateCondition(c, state));
    case 'any':
      return cond.conditions.some((c) => evaluateCondition(c, state));
    case 'not':
      return !evaluateCondition(cond.condition, state);
  }
}
