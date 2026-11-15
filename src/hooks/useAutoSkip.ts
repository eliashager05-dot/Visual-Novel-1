import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { usePersistentStore } from '@/store/persistentStore';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';

const TITLE_CARD_MS = 3200;
const SKIP_INTERVAL_MS = 70;

/** Drives auto mode, skip mode and title-card auto-advance. */
export function useAutoSkip() {
  const game = useGameStore((s) => s.game);
  const advance = useGameStore((s) => s.advance);
  const { auto, skip, textComplete, overlay, transitioning } = useUi();
  const { autoDelay, autoPerChar } = useSettings();

  const p = game?.presentation;

  // Auto mode: wait for the line to finish, then a reading pause.
  useEffect(() => {
    if (!auto || skip || overlay !== 'none' || transitioning || p?.kind !== 'line' || !textComplete) return;
    const t = setTimeout(advance, autoDelay + p.line.text.length * autoPerChar);
    return () => clearTimeout(t);
  }, [auto, skip, overlay, transitioning, p, textComplete, autoDelay, autoPerChar, advance]);

  // Title cards advance by themselves.
  useEffect(() => {
    if (p?.kind !== 'title' || overlay !== 'none' || skip) return;
    const t = setTimeout(advance, TITLE_CARD_MS);
    return () => clearTimeout(t);
  }, [p, overlay, skip, advance]);

  // Skip mode: fast-forward through read lines; stop at unread lines and choices.
  useEffect(() => {
    if (!skip) return;
    const id = setInterval(() => {
      const ui = useUi.getState();
      if (ui.transitioning || ui.overlay !== 'none') return;
      const g = useGameStore.getState().game;
      if (!g) return;
      const pres = g.presentation;
      if (pres.kind === 'title') return useGameStore.getState().advance();
      if (pres.kind !== 'line') return ui.setSkip(false);
      const read = usePersistentStore.getState().isRead(pres.line.key);
      if (read || useSettings.getState().skipUnread) useGameStore.getState().advance();
      else ui.setSkip(false);
    }, SKIP_INTERVAL_MS);
    return () => clearInterval(id);
  }, [skip]);
}
