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
