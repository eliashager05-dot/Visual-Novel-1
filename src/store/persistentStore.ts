import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { EngineEvent } from '@/types';

/**
 * Progress that belongs to the PLAYER, not to a save file: read lines (for
 * skip-read), gallery and scene unlocks, endings seen. Survives new games.
 */
interface PersistentState {
  readLines: Record<string, true>;
  unlockedGallery: Record<string, true>;
  unlockedScenes: Record<string, true>;
  endingsSeen: Record<string, true>;
  /** Characters ever met in any playthrough (gallery profiles). */
  charactersMet: Record<string, true>;
  /** Every scene ever entered, in any playthrough (achievements). */
  scenesSeen: Record<string, true>;
  chaptersCompleted: Record<string, true>;
  /** Achievement id → unlock time. */
  achievements: Record<string, number>;
  /** Records scenes and a completed chapter from the current state. */
  trackProgress: (visited: string[], completedChapter: string | null) => void;
  unlockAchievements: (ids: string[]) => void;
  markRead: (key: string) => void;
  isRead: (key: string) => boolean;
  ingestEvents: (events: EngineEvent[]) => void;
  resetProgress: () => void;
}

const empty = () => ({
  readLines: {},
  unlockedGallery: {},
  unlockedScenes: {},
  endingsSeen: {},
  charactersMet: {},
  scenesSeen: {} as Record<string, true>,
  chaptersCompleted: {} as Record<string, true>,
  achievements: {} as Record<string, number>,
});

export const usePersistentStore = create<PersistentState>()(
  persist(
    (set, get) => ({
      ...empty(),
      markRead: (key) => {
        if (get().readLines[key]) return;
        set((s) => ({ readLines: { ...s.readLines, [key]: true } }));
      },
      isRead: (key) => Boolean(get().readLines[key]),
      ingestEvents: (events) => {
        const add = (field: 'unlockedGallery' | 'unlockedScenes' | 'endingsSeen' | 'charactersMet', id: string) =>
          set((s) => (s[field][id] ? s : { ...s, [field]: { ...s[field], [id]: true } }));
        for (const e of events) {
          if (e.type === 'unlockGallery') add('unlockedGallery', e.id);
          else if (e.type === 'unlockScene') add('unlockedScenes', e.id);
          else if (e.type === 'ending') add('endingsSeen', e.id);
          else if (e.type === 'characterMet') add('charactersMet', e.character);
        }
      },
      trackProgress: (visited, completedChapter) => {
        const s = get();
        const fresh = visited.filter((v) => !s.scenesSeen[v]);
        const chapterNew = completedChapter && !s.chaptersCompleted[completedChapter];
        if (!fresh.length && !chapterNew) return;
        set({
          scenesSeen: fresh.length ? { ...s.scenesSeen, ...Object.fromEntries(fresh.map((v) => [v, true as const])) } : s.scenesSeen,
          chaptersCompleted: chapterNew ? { ...s.chaptersCompleted, [completedChapter]: true } : s.chaptersCompleted,
        });
      },
      unlockAchievements: (ids) => {
        if (!ids.length) return;
        const now = Date.now();
        set((s) => ({ achievements: { ...s.achievements, ...Object.fromEntries(ids.map((id) => [id, now])) } }));
      },
      resetProgress: () => set(empty()),
    }),
    {
      name: 'halcyon:persistent',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        readLines: s.readLines,
        unlockedGallery: s.unlockedGallery,
        unlockedScenes: s.unlockedScenes,
        endingsSeen: s.endingsSeen,
        charactersMet: s.charactersMet,
        scenesSeen: s.scenesSeen,
        chaptersCompleted: s.chaptersCompleted,
        achievements: s.achievements,
      }),
    },
  ),
);
