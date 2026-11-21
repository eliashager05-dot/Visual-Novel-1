import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type DialogueStyle = 'cinematic' | 'panel';

export interface Settings {
  /** 'cinematic': centred subtitles over the image (rendered-VN style). 'panel': classic text box. */
  dialogueStyle: DialogueStyle;
  /** Show "X will remember that." notices. */
  relationshipNotices: boolean;
  /** Play animated clips where they exist; off = always show the still. */
  animations: boolean;
  /** Characters per second; 0 = instant. */
  textSpeed: number;
  /** Base pause (ms) after a line finishes before auto mode advances. */
  autoDelay: number;
  /** Extra auto-mode time per character (ms) so long lines get read. */
  autoPerChar: number;
  skipUnread: boolean;
  musicVolume: number;
  sfxVolume: number;
  /** Silences everything without touching the volume sliders. */
  muted: boolean;
  /** Dialogue panel opacity 0.3–1. */
  boxOpacity: number;
  ageConfirmed: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  dialogueStyle: 'cinematic',
  relationshipNotices: true,
  animations: true,
  textSpeed: 45,
  autoDelay: 1200,
  autoPerChar: 28,
  skipUnread: false,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  muted: false,
  boxOpacity: 0.45,
  ageConfirmed: false,
};

interface SettingsStore extends Settings {
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      update: (patch) => set(patch),
      reset: () => set({ ...DEFAULT_SETTINGS, ageConfirmed: true }),
    }),
    {
      name: 'halcyon:settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ update: _u, reset: _r, ...rest }) => rest,
    },
  ),
);
