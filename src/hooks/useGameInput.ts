import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import { useAdvanceIntent } from './useGameController';

function isTyping(e: Event) {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

/**
 * Keyboard & wheel bindings for the in-game screen.
 *  Space/Enter/→ advance · Esc pause/close · H hide UI · A auto · S skip
 *  Ctrl (hold) skip · L or wheel-up history · wheel-down advance
 *  Backspace/PageUp rollback · R relationships · F5 quick save · F9 quick load
 */
export function useGameInput() {
  const advanceIntent = useAdvanceIntent();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e)) return;
      const ui = useUi.getState();
      const kind = useGameStore.getState().game?.presentation.kind;

      // Quick save/load work everywhere in-game; F5 must not reload the page.
      if (e.key === 'F5') {
        e.preventDefault();
        if (ui.overlay === 'none') useGameStore.getState().quickSave();
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        if (ui.overlay === 'none') useGameStore.getState().quickLoad();
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (ui.hideUi) ui.setHideUi(false);
        else ui.setOverlay(ui.overlay === 'none' ? 'pause' : 'none');
        return;
      }
      if (ui.overlay !== 'none') return;

      switch (e.key) {
        case ' ':
        case 'Enter':
        case 'ArrowRight':
          if (kind === 'choice') return; // the choice menu owns these keys
          e.preventDefault();
          advanceIntent();
          break;
        case 'h':
        case 'H':
          ui.setHideUi(!ui.hideUi);
          break;
        case 'a':
        case 'A':
          ui.setAuto(!ui.auto);
          break;
        case 's':
        case 'S':
          ui.setSkip(!ui.skip);
          break;
        case 'l':
        case 'L':
          ui.setOverlay('history');
          break;
        case 'Backspace':
        case 'PageUp':
          e.preventDefault();
          if (!ui.transitioning) useGameStore.getState().rollback();
          break;
        case 'p':
        case 'P':
          ui.setOverlay('phone');
          break;
        case 'm':
        case 'M': {
          const s = useSettings.getState();
          s.update({ muted: !s.muted });
          break;
        }
        case 'r':
        case 'R':
          if (useGameStore.getState().mode === 'story') ui.setOverlay('relationships');
          break;
        case 'Control':
          if (!e.repeat) ui.setSkip(true);
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') useUi.getState().setSkip(false);
    };
    const onWheel = (e: WheelEvent) => {
      const ui = useUi.getState();
      if (ui.overlay !== 'none') return;
      if (e.deltaY < 0) ui.setOverlay('history');
      else if (e.deltaY > 0) advanceIntent();
    };
    // Releasing Ctrl outside the window would otherwise leave skip stuck on.
    const onBlur = () => useUi.getState().setSkip(false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('blur', onBlur);
    };
  }, [advanceIntent]);
}
