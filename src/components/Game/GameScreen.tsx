import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';
import { useAdvanceIntent } from '@/hooks/useGameController';
import { useAutoSkip } from '@/hooks/useAutoSkip';
import { useDeferredView } from '@/hooks/useDeferredView';
import { useEventToasts } from '@/hooks/useEventToasts';
import { useGameInput } from '@/hooks/useGameInput';
import type { DisplayedLine } from '@/types';
import { CharacterLayer } from '../CharacterRenderer/CharacterRenderer';
import { ChoiceMenu } from '../ChoiceMenu/ChoiceMenu';
import { DialogueBox } from '../DialogueBox/DialogueBox';
import { QuickMenu } from '../DialogueBox/QuickMenu';
import { DebugPanel } from '../Overlays/DebugPanel';
import { EndCard } from '../Overlays/EndCard';
import { HistoryPanel } from '../Overlays/HistoryPanel';
import { PauseMenu } from '../Overlays/PauseMenu';
import { ScreenCover } from '../Overlays/ScreenCover';
import { TitleCard } from '../Overlays/TitleCard';
import { Toasts } from '../Overlays/Toasts';
import { BackgroundLayer } from '../Stage/BackgroundLayer';
import { CgLayer } from '../Stage/CgLayer';

export function GameScreen() {
  useGameInput();
  useAutoSkip();
  useEventToasts();
  const { view, cover, flashKey } = useDeferredView();
  const game = useGameStore((s) => s.game);
  const choose = useGameStore((s) => s.choose);
  const error = useGameStore((s) => s.error);
  const { hideUi, overlay, auto, skip, setHideUi } = useUi();
  const advanceIntent = useAdvanceIntent();

  if (!view || !game) return null;
  const p = view.presentation;
  const speaker = p.kind === 'line' && p.line.kind === 'say' ? p.line.speaker : null;

  // Behind a choice, keep the line that led to it visible (dimmed).
  let lastLine: DisplayedLine | null = null;
  if (p.kind === 'choice') {
    const h = [...game.history].reverse().find((e) => e.kind !== 'choice');
    if (h && h.kind !== 'choice') lastLine = { ...h, kind: h.kind, key: '' };
  }

  return (
    <div
      className="absolute inset-0"
      onClick={advanceIntent}
      onContextMenu={(e) => {
        e.preventDefault();
        if (overlay === 'none') setHideUi(!hideUi);
      }}
    >
      <BackgroundLayer id={view.stage.background} />
      <CharacterLayer characters={view.stage.characters} speaker={speaker} />
      <CgLayer id={view.stage.cg} />
      {/* Soft gradient so text stays legible over bright art. */}
      {!hideUi && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-black/55 to-transparent" />}

      {!hideUi && p.kind === 'line' && (
        <>
          <DialogueBox line={p.line} lineId={game.lineCount} />
          <QuickMenu />
        </>
      )}
      {!hideUi && p.kind === 'choice' && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-black/30 transition-opacity" />
          {lastLine && <DialogueBox line={lastLine} lineId={-1} dimmed />}
          <ChoiceMenu choice={p.choice} onChoose={choose} />
        </>
      )}
      {(auto || skip) && !hideUi && (
        <div className="pointer-events-none absolute left-[48px] top-[44px] text-[16px] uppercase tracking-[0.35em] text-[#e8c88f]/80">
          {skip ? 'Skipping ▸▸' : 'Auto ▸'}
        </div>
      )}

      <AnimatePresence>{p.kind === 'title' && <TitleCard key={p.title + p.subtitle} title={p.title} subtitle={p.subtitle} />}</AnimatePresence>
      {p.kind === 'end' && <EndCard ending={p.ending} nextChapter={p.nextChapter} />}

      <Toasts />
      <ScreenCover cover={cover} flashKey={flashKey} />
      <AnimatePresence>
        {overlay === 'history' && <HistoryPanel key="history" />}
        {overlay === 'pause' && <PauseMenu key="pause" />}
      </AnimatePresence>

      {error && (
        <div className="absolute left-1/2 top-8 z-[70] -translate-x-1/2 rounded-lg bg-red-950/90 px-6 py-3 text-[18px] text-red-100">
          Story error: {error}
        </div>
      )}
      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
}
