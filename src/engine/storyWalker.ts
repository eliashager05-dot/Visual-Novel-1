import type { GameState } from '@/types';
import { advance, choose, createNewGame } from './dialogueEngine';
import type { SceneManager } from './sceneManager';

export interface WalkResult {
  /** Number of distinct complete playthroughs explored. */
  paths: number;
  endings: Record<string, number>;
  scenesReached: Set<string>;
  /** Choice options that were never selectable in any explored path. */
  unreachableOptions: string[];
  errors: { path: string[]; message: string }[];
  truncated: boolean;
}

/**
 * Exhaustively plays every choice combination (depth-first) from the start of
 * a chapter. This is the automated "test all story branches" pass: it catches
 * runtime errors, dead ends and options that can never be picked.
 */
export function walkStory(
  manager: SceneManager,
  opts: { startScene?: string; maxPaths?: number; maxLinesPerPath?: number } = {},
): WalkResult {
  const maxPaths = opts.maxPaths ?? 5000;
  const maxLines = opts.maxLinesPerPath ?? 20_000;
  const result: WalkResult = {
    paths: 0,
    endings: {},
    scenesReached: new Set(),
    unreachableOptions: [],
    errors: [],
    truncated: false,
  };
  const seenOptions = new Set<string>();
  const allOptions = new Set<string>();
  for (const s of manager.compileAll()) {
    for (const i of s.instructions) if (i.type === 'choice') for (const o of i.options) allOptions.add(`${i.id}/${o.id}`);
  }

  const stack: { state: GameState; path: string[] }[] = [];
  try {
    stack.push({ state: createNewGame(manager, { playerName: 'Tester', startScene: opts.startScene }).state, path: [] });
  } catch (e) {
    result.errors.push({ path: [], message: (e as Error).message });
    return result;
  }

  while (stack.length) {
    if (result.paths >= maxPaths) {
      result.truncated = true;
      break;
    }
    const item = stack.pop()!;
    let state = item.state;
    try {
      for (let lines = 0; ; lines++) {
        if (lines > maxLines) throw new Error('path exceeded line limit (possible loop)');
        const p = state.presentation;
        if (p.kind === 'end') {
          result.paths++;
          const key = p.ending ?? 'chapter_end';
          result.endings[key] = (result.endings[key] ?? 0) + 1;
          state.visitedScenes.forEach((v) => result.scenesReached.add(v));
          break;
        }
        if (p.kind === 'choice') {
          state.visitedScenes.forEach((v) => result.scenesReached.add(v));
          for (const o of p.choice.options) {
            if (!o.enabled) continue;
            const key = `${p.choice.choiceId}/${o.id}`;
            seenOptions.add(key);
            stack.push({ state: choose(manager, state, o.id).state, path: [...item.path, key] });
          }
          break;
        }
        state = advance(manager, state).state;
      }
    } catch (e) {
      result.errors.push({ path: item.path, message: (e as Error).message });
    }
  }

  result.unreachableOptions = [...allOptions].filter((o) => !seenOptions.has(o));
  return result;
}

export interface SampleResult {
  runs: number;
  endings: Record<string, number>;
  scenesReached: Set<string>;
  /** "choiceId/optionId" pairs never picked in any sampled run. */
  unreachableOptions: string[];
  errors: { path: string[]; message: string }[];
  /** Lines shown per playthrough (reading-length estimate). */
  lines: { min: number; max: number; avg: number };
}

/**
 * Random-walk exploration for content too branchy to enumerate. Each run picks
 * uniformly among enabled options using a seeded PRNG, so results are
 * reproducible. Reports coverage (options never reached) and length stats.
 */
export function sampleStory(
  manager: SceneManager,
  opts: { runs?: number; seed?: number; startScene?: string; maxLinesPerPath?: number } = {},
): SampleResult {
  const runs = opts.runs ?? 500;
  const maxLines = opts.maxLinesPerPath ?? 20_000;
  let seed = opts.seed ?? 1;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const allOptions = new Set<string>();
  for (const s of manager.compileAll()) {
    for (const i of s.instructions) if (i.type === 'choice') for (const o of i.options) allOptions.add(`${i.id}/${o.id}`);
  }
  const seen = new Set<string>();
  const result: SampleResult = {
    runs: 0,
    endings: {},
    scenesReached: new Set(),
    unreachableOptions: [],
    errors: [],
    lines: { min: Infinity, max: 0, avg: 0 },
  };
  let totalLines = 0;
  for (let r = 0; r < runs; r++) {
    const path: string[] = [];
    try {
      let state = createNewGame(manager, { playerName: 'Tester', startScene: opts.startScene }).state;
      for (let steps = 0; ; steps++) {
        if (steps > maxLines) throw new Error('path exceeded line limit (possible loop)');
        const p = state.presentation;
        if (p.kind === 'end') {
          const key = p.ending ?? 'chapter_end';
          result.endings[key] = (result.endings[key] ?? 0) + 1;
          state.visitedScenes.forEach((v) => result.scenesReached.add(v));
          result.lines.min = Math.min(result.lines.min, state.lineCount);
          result.lines.max = Math.max(result.lines.max, state.lineCount);
          totalLines += state.lineCount;
          result.runs++;
          break;
        }
        if (p.kind === 'choice') {
          const enabled = p.choice.options.filter((o) => o.enabled);
          const pick = enabled[Math.floor(rand() * enabled.length)]!;
          const key = `${p.choice.choiceId}/${pick.id}`;
          seen.add(key);
          path.push(key);
          state = choose(manager, state, pick.id).state;
          continue;
        }
        state = advance(manager, state).state;
      }
    } catch (e) {
      result.errors.push({ path, message: (e as Error).message });
    }
  }
  result.lines.avg = result.runs ? Math.round(totalLines / result.runs) : 0;
  if (!result.runs) result.lines.min = 0;
  result.unreachableOptions = [...allOptions].filter((o) => !seen.has(o));
  return result;
}
