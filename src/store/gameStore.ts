import { create } from 'zustand';
import { content } from '@/data';
import { advance, choose, createNewGame, SceneManager, type EngineResult } from '@/engine';
import type { EngineEvent, GameState } from '@/types';
import { usePersistentStore } from './persistentStore';

/** One manager for the app lifetime; it caches compiled scenes. */
export const sceneManager = new SceneManager(content);

interface GameStore {
  game: GameState | null;
  /** Events from the most recent engine step, for the presentation layer. */
  events: EngineEvent[];
  /** Increments every step so effects can key off "new events arrived". */
  eventSeq: number;
  error: string | null;

  newGame: (playerName: string) => void;
  advance: () => void;
  choose: (optionId: string) => void;
  /** Replace the running state wholesale (used by load). */
  loadState: (state: GameState) => void;
  quitToTitle: () => void;
}

export const useGameStore = create<GameStore>()((set, get) => {
  const commit = (fn: () => EngineResult) => {
    try {
      const { state, events } = fn();
      const persistent = usePersistentStore.getState();
      persistent.ingestEvents(events);
      set({ game: state, events, eventSeq: get().eventSeq + 1, error: null });
    } catch (e) {
      // Surface content/engine bugs instead of freezing silently.
      console.error(e);
      set({ error: (e as Error).message });
    }
  };

  return {
    game: null,
    events: [],
    eventSeq: 0,
    error: null,

    newGame: (playerName) => commit(() => createNewGame(sceneManager, { playerName })),
    advance: () => {
      const { game } = get();
      if (!game) return;
      // Mark the line being dismissed as read before moving on.
      if (game.presentation.kind === 'line') usePersistentStore.getState().markRead(game.presentation.line.key);
      commit(() => advance(sceneManager, game));
    },
    choose: (optionId) => {
      const { game } = get();
      if (!game) return;
      commit(() => choose(sceneManager, game, optionId));
    },
    loadState: (state) => set({ game: state, events: [], error: null }),
    quitToTitle: () => set({ game: null, events: [], error: null }),
  };
});
