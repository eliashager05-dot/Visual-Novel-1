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
  markRead: (key: string) => void;
  isRead: (key: string) => boolean;
  ingestEvents: (events: EngineEvent[]) => void;
  resetProgress: () => void;
}

const empty = () => ({ readLines: {}, unlockedGallery: {}, unlockedScenes: {}, endingsSeen: {}, charactersMet: {} });

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
      }),
    },
  ),
);
