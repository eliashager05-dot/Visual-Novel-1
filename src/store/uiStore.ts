import { create } from 'zustand';

export type Overlay = 'none' | 'history' | 'pause' | 'save' | 'load' | 'settings' | 'relationships';

export type MenuScreen = 'none' | 'load' | 'gallery' | 'settings';

export interface Toast {
  id: number;
  text: string;
  tone: 'up' | 'down' | 'milestone' | 'info';
  color?: string;
}

/** Interface-only state. Never saved; reset when returning to the title. */
interface UiStore {
  /** True once the typewriter has revealed the full current line. */
  textComplete: boolean;
  /** Bumped to ask the typewriter to finish instantly. */
  completeSignal: number;
  auto: boolean;
  skip: boolean;
  hideUi: boolean;
  overlay: Overlay;
  /** Input is blocked while a screen transition covers the stage. */
  transitioning: boolean;
  toasts: Toast[];
  /** Sub-screen open over the title menu. */
  menuScreen: MenuScreen;

  setTextComplete: (v: boolean) => void;
  requestComplete: () => void;
  setAuto: (v: boolean) => void;
  setSkip: (v: boolean) => void;
  setHideUi: (v: boolean) => void;
  setOverlay: (o: Overlay) => void;
  setTransitioning: (v: boolean) => void;
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  setMenuScreen: (m: MenuScreen) => void;
  reset: () => void;
}

let toastId = 0;

export const useUi = create<UiStore>()((set) => ({
  textComplete: false,
  completeSignal: 0,
  auto: false,
  skip: false,
  hideUi: false,
  overlay: 'none',
  transitioning: false,
  toasts: [],
  menuScreen: 'none',

  setTextComplete: (textComplete) => set({ textComplete }),
  requestComplete: () => set((s) => ({ completeSignal: s.completeSignal + 1 })),
  // Auto and skip are mutually exclusive, as in most VNs.
  setAuto: (auto) => set(auto ? { auto, skip: false } : { auto }),
  setSkip: (skip) => set(skip ? { skip, auto: false } : { skip }),
  setHideUi: (hideUi) => set({ hideUi }),
  setOverlay: (overlay) => set({ overlay, ...(overlay !== 'none' ? { skip: false, auto: false } : {}) }),
  setTransitioning: (transitioning) => set({ transitioning }),
  pushToast: (t) => set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id: ++toastId }] })),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  setMenuScreen: (menuScreen) => set({ menuScreen }),
  reset: () =>
    set({ textComplete: false, auto: false, skip: false, hideUi: false, overlay: 'none', transitioning: false, toasts: [] }),
}));
