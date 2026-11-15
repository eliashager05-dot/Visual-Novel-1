import { useEffect, useState } from 'react';
import type { GameState, TransitionKind } from '@/types';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';

export interface Cover {
  color: string;
  phase: 'in' | 'out';
  /** Seconds for this phase. */
  duration: number;
  key: number;
}

type View = Pick<GameState, 'stage' | 'presentation'>;

const COVERING: Partial<Record<TransitionKind, string>> = { fade: '#000', black: '#000', white: '#fff' };

let coverKey = 0;

/**
 * Returns what the screen should show right now. For covering transitions
 * (fade/black/white) the previous view stays up until the screen is fully
 * covered, then swaps — so a scene change never pops in before the fade.
 */
export function useDeferredView(): { view: View | null; cover: Cover | null; flashKey: number } {
  const game = useGameStore((s) => s.game);
  const events = useGameStore((s) => s.events);
  const [view, setView] = useState<View | null>(game);
  const [cover, setCover] = useState<Cover | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  useEffect(() => {
    if (!game) {
      setView(null);
      return;
    }
    const ui = useUi.getState();
    const t = events.find((e) => e.type === 'transition');
    if (t?.type === 'transition' && t.kind === 'flash') setFlashKey((k) => k + 1);

    const color = t?.type === 'transition' ? COVERING[t.kind] : undefined;
    if (!color || ui.skip) {
      setView(game);
      setCover(null);
      ui.setTransitioning(false);
      return;
    }
    const total = t?.type === 'transition' && t.duration ? t.duration : 1.2;
    const half = total / 2;
    ui.setTransitioning(true);
    setCover({ color, phase: 'in', duration: half, key: ++coverKey });
    const a = setTimeout(() => {
      setView(game);
      setCover({ color, phase: 'out', duration: half, key: ++coverKey });
    }, half * 1000);
    const b = setTimeout(() => {
      setCover(null);
      useUi.getState().setTransitioning(false);
    }, total * 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [game, events]);

  return { view, cover, flashKey };
}
