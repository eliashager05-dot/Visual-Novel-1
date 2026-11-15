import { create } from 'zustand';
import { SaveRepository, type SaveStorage, type SlotId, type SaveRecord } from '@/engine';

function localStorageAdapter(): SaveStorage {
  return {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    remove: (k) => localStorage.removeItem(k),
    keys: () => Object.keys(localStorage),
  };
}

export const saveRepo = new SaveRepository(localStorageAdapter());

/** Reactive index of save slots for the menus. Mutations go through saveRepo, then refresh(). */
interface SaveIndex {
  records: Partial<Record<SlotId, SaveRecord>>;
  latest: SaveRecord | null;
  refresh: () => void;
}

export const useSaves = create<SaveIndex>()((set) => ({
  records: {},
  latest: null,
  refresh: () => {
    const list = saveRepo.list();
    const records: Partial<Record<SlotId, SaveRecord>> = {};
    for (const r of list) records[r.slot] = r;
    set({ records, latest: list[0] ?? null });
  },
}));

useSaves.getState().refresh();
