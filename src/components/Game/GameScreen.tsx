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
import { MapChoice } from '../ChoiceMenu/MapChoice';
import { ClockChip } from '../DialogueBox/ClockChip';
import { CinematicDialogue } from '../DialogueBox/CinematicDialogue';
import { DialogueBox } from '../DialogueBox/DialogueBox';
import { Hud } from '../DialogueBox/Hud';
import { DebugPanel } from '../Overlays/DebugPanel';
import { EndCard } from '../Overlays/EndCard';
import { HistoryPanel } from '../Overlays/HistoryPanel';
import { PauseMenu } from '../Overlays/PauseMenu';
import { RelationshipScreen } from '../Relationships/RelationshipScreen';
import { SaveLoadScreen } from '../SaveMenu/SaveLoadScreen';
import { SettingsScreen } from '../SettingsMenu/SettingsScreen';
import { ScreenCover } from '../Overlays/ScreenCover';
import { TitleCard } from '../Overlays/TitleCard';
import { BackgroundLayer } from '../Stage/BackgroundLayer';
import { CgLayer } from '../Stage/CgLayer';
import { PhoneApp } from '../Phone/PhoneApp';
import { PhoneView } from '../Phone/PhoneView';
import { EffectsLayer } from '../Stage/EffectsLayer';
import { ShotLayer } from '../Stage/ShotLayer';
import { useSettings } from '@/store/settingsStore';

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
  const cinematic = useSettings((s) => s.dialogueStyle) === 'cinematic';
  const Dialogue = cinematic ? CinematicDialogue : DialogueBox;

  const closeToPause = () => useUi.getState().setOverlay('none');

  if (!view || !game) return null;
  const p = view.presentation;
  const speaker = p.kind === 'line' && p.line.kind === 'say' ? p.line.speaker : null;
  const phoneOpen = view.stage.phone;

  // Behind a choice, keep the line that led to it visible (dimmed).
  let lastLine: DisplayedLine | null = null;
  if (p.kind === 'choice') {
    const h = [...game.history].reverse().find((e) => e.kind !== 'choice');
    if (h && h.kind !== 'choice' && h.kind !== 'text') lastLine = { ...h, kind: h.kind, key: '' };
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
      {/* In shot mode the render already contains the characters. */}
      {!view.stage.shot && <CharacterLayer characters={view.stage.characters} speaker={speaker} />}
      <ShotLayer id={view.stage.shot} />
      <CgLayer id={view.stage.cg} />
      {!view.stage.cg && <EffectsLayer fx={view.stage.fx} />}
      {/* Soft gradient so panel text stays legible over bright art (cinematic mode draws its own). */}
      {!hideUi && !cinematic && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-gradient-to-t from-black/55 to-transparent" />}

      {!hideUi && <PhoneView thread={phoneOpen} replying={p.kind === 'choice'} />}
      {!hideUi && p.kind === 'line' && (
        <>
          {/* Messages appear in the phone itself, not as subtitles. */}
          {p.line.kind !== 'text' && <Dialogue line={p.line} lineId={game.lineCount} narrow={Boolean(phoneOpen)} />}
          <Hud raised={!cinematic} />
        </>
      )}
      {!hideUi && p.kind === 'choice' && p.choice.map && (
        <>
          <MapChoice choice={p.choice} onChoose={choose} />
          <Hud raised={!cinematic} />
        </>
      )}
      {!hideUi && p.kind === 'choice' && !p.choice.map && (
        <>
          {!phoneOpen && <div className="pointer-events-none absolute inset-y-0 right-0 w-[1000px] bg-gradient-to-l from-black/35 to-transparent" />}
          {lastLine && <Dialogue line={lastLine} lineId={-1} dimmed narrow={Boolean(phoneOpen)} />}
          <ChoiceMenu choice={p.choice} onChoose={choose} variant={phoneOpen ? 'phone' : 'screen'} />
          <Hud raised={!cinematic} />
        </>
      )}
      {!hideUi && game.clock && p.kind !== 'title' && !(p.kind === 'choice' && p.choice.map) && <ClockChip clock={game.clock} />}
      {(auto || skip) && !hideUi && (
        <div className="pointer-events-none absolute left-[48px] top-[92px] text-[16px] uppercase tracking-[0.35em] text-[#e8c88f]/80">
          {skip ? 'Skipping ▸▸' : 'Auto ▸'}
        </div>
      )}

      <AnimatePresence>{p.kind === 'title' && <TitleCard key={p.title + p.subtitle} title={p.title} subtitle={p.subtitle} />}</AnimatePresence>
      {p.kind === 'end' && <EndCard ending={p.ending} nextChapter={p.nextChapter} chapterComplete={p.chapterComplete} />}

      <ScreenCover cover={cover} flashKey={flashKey} />
      <AnimatePresence>
        {overlay === 'history' && <HistoryPanel key="history" />}
        {overlay === 'pause' && <PauseMenu key="pause" />}
        {overlay === 'save' && <SaveLoadScreen key="save" mode="save" onClose={closeToPause} />}
        {overlay === 'load' && <SaveLoadScreen key="load" mode="load" onClose={closeToPause} />}
        {overlay === 'settings' && <SettingsScreen key="settings" onClose={closeToPause} />}
        {overlay === 'relationships' && <RelationshipScreen key="rel" game={game} onClose={closeToPause} />}
        {overlay === 'phone' && <PhoneApp key="phone" />}
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
