import { create } from 'zustand';
import { content } from '@/data';
import {
  advance,
  choose,
  createNewGame,
  createSaveRecord,
  resume,
  restoreState,
  SaveError,
  SceneManager,
  type EngineResult,
  type SaveKind,
  type SlotId,
} from '@/engine';
import type { EngineEvent, GameState } from '@/types';
import { achievements } from '@/data/achievements';
import { newlyEarned } from '@/engine/achievements';
import { usePersistentStore } from './persistentStore';
import { saveRepo, useSaves } from './saveStore';
import { useUi } from './uiStore';

/** One manager for the app lifetime; it caches compiled scenes. */
export const sceneManager = new SceneManager(content);

const ROLLBACK_LIMIT = 80;

/** 'story' is a real playthrough; 'replay' is a gallery scene replay (no saves, ends back in the gallery). */
export type PlayMode = 'story' | 'replay';

interface GameStore {
  game: GameState | null;
  mode: PlayMode;
  /** Scene being replayed from the gallery (replay mode only). */
  replayScene: string | null;
  /** Events from the most recent engine step, for the presentation layer. */
  events: EngineEvent[];
  /** Previous states for rollback (newest last). Not saved. */
  past: GameState[];
  error: string | null;

  newGame: (playerName: string) => void;
  startReplay: (sceneId: string) => void;
  advance: () => void;
  choose: (optionId: string) => void;
  rollback: () => void;
  save: (slot: SlotId, kind?: SaveKind) => boolean;
  load: (slot: SlotId) => boolean;
  quickSave: () => void;
  quickLoad: () => void;
  quitToTitle: () => void;
}

const notify = (text: string) => useUi.getState().pushToast({ tone: 'info', text });

/** Notes scenes seen and chapters finished, then unlocks any achievements now earned. */
function recordProgress(state: GameState) {
  const p = usePersistentStore.getState();
  const chapter =
    state.presentation.kind === 'end' && state.presentation.chapterComplete
      ? (content.scenes[state.pointer.scene]?.chapter ?? null)
      : null;
  p.trackProgress(state.visitedScenes, chapter);
  const after = usePersistentStore.getState();
  const earned = newlyEarned(achievements, after.achievements, state, {
    scenesSeen: after.scenesSeen,
    chaptersCompleted: after.chaptersCompleted,
  });
  if (!earned.length) return;
  after.unlockAchievements(earned.map((a) => a.id));
  for (const a of earned) useUi.getState().pushToast({ tone: 'achievement', text: a.title });
}

export const useGameStore = create<GameStore>()((set, get) => {
  /** Apply an engine result; returns false (and records the error) on failure. */
  const commit = (fn: () => EngineResult, opts: { pushPast?: boolean; autosave?: boolean } = {}) => {
    const prev = get().game;
    try {
      const { state, events } = fn();
      // A replay covers exactly one scene: stop at the boundary.
      const { mode, replayScene } = get();
      if (mode === 'replay' && replayScene && state.pointer.scene !== replayScene) {
        state.presentation = { kind: 'end' };
      }
      usePersistentStore.getState().ingestEvents(events);
      const past = opts.pushPast && prev ? [...get().past, prev].slice(-ROLLBACK_LIMIT) : get().past;
      set({ game: state, events, past, error: null });
      recordProgress(state);
      // Autosave on entering a new scene and after every decision.
      const sceneChanged = prev && prev.pointer.scene !== state.pointer.scene;
      if (get().mode === 'story' && (opts.autosave || sceneChanged) && state.presentation.kind !== 'end') {
        writeSave(state, saveRepo.nextAutoSlot(), 'auto');
      }
      return true;
    } catch (e) {
      console.error(e);
      set({ error: (e as Error).message });
      return false;
    }
  };

  const writeSave = (state: GameState, slot: SlotId, kind: SaveKind) => {
    try {
      saveRepo.write(createSaveRecord(sceneManager, state, slot, kind));
      useSaves.getState().refresh();
      return true;
    } catch (e) {
      notify(e instanceof SaveError ? e.message : 'Saving failed');
      return false;
    }
  };

  return {
    game: null,
    mode: 'story',
    replayScene: null,
    events: [],
    past: [],
    error: null,

    newGame: (playerName) => {
      set({ mode: 'story', replayScene: null, past: [] });
      commit(() => createNewGame(sceneManager, { playerName }));
    },

    startReplay: (sceneId) => {
      set({ mode: 'replay', replayScene: sceneId, past: [] });
      commit(() => createNewGame(sceneManager, { playerName: content.defaultPlayerName, startScene: sceneId }));
    },

    advance: () => {
      const { game } = get();
      if (!game) return;
      const p = game.presentation;
      if (p.kind === 'line') usePersistentStore.getState().markRead(p.line.key);
      if (p.kind !== 'line' && p.kind !== 'title') return;
      commit(() => advance(sceneManager, game), { pushPast: true });
    },

    choose: (optionId) => {
      const { game } = get();
      if (!game) return;
      commit(() => choose(sceneManager, game, optionId), { pushPast: true, autosave: true });
    },

    rollback: () => {
      const { past } = get();
      const prev = past[past.length - 1];
      if (!prev) return;
      set({ game: prev, past: past.slice(0, -1), events: [], error: null });
    },

    save: (slot, kind = 'manual') => {
      const { game, mode } = get();
      if (!game || mode !== 'story') return false;
      const ok = writeSave(game, slot, kind);
      if (ok) notify(kind === 'quick' ? 'Quick saved' : 'Game saved');
      return ok;
    },

    load: (slot) => {
      const record = saveRepo.read(slot);
      if (!record) {
        notify('That save could not be read');
        return false;
      }
      try {
        const { state, outcome } = restoreState(sceneManager, record);
        useUi.getState().reset();
        set({ mode: 'story', replayScene: null, past: [] });
        if (outcome === 'rewound') {
          commit(() => resume(sceneManager, state));
          notify('The story was updated since this save — resuming from the start of the scene');
        } else {
          set({ game: state, events: [], error: null });
          recordProgress(state);
          notify('Game loaded');
        }
        return true;
      } catch (e) {
        notify(e instanceof SaveError ? e.message : 'Loading failed');
        return false;
      }
    },

    quickSave: () => void get().save('quick', 'quick'),
    quickLoad: () => {
      if (!saveRepo.read('quick')) return notify('No quick save yet');
      get().load('quick');
    },

    quitToTitle: () => set({ game: null, events: [], past: [], error: null, mode: 'story', replayScene: null }),
  };
});
