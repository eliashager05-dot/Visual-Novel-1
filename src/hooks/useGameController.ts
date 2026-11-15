import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';

/**
 * The single "player wants to continue" gate used by clicks, keys and the
 * wheel. Order matters: unhide UI → finish typewriter → advance.
 */
export function useAdvanceIntent() {
  return useCallback(() => {
    const ui = useUi.getState();
    const { game, advance } = useGameStore.getState();
    if (!game || ui.transitioning || ui.overlay !== 'none') return;
    if (ui.hideUi) {
      ui.setHideUi(false);
      return;
    }
    if (ui.skip) ui.setSkip(false);
    const p = game.presentation;
    if (p.kind === 'line' && !ui.textComplete) {
      ui.requestComplete();
      return;
    }
    if (p.kind === 'line' || p.kind === 'title') advance();
  }, []);
}
