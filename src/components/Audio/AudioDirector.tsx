import { useEffect, useRef } from 'react';
import { audioEngine } from '@/lib/audio/audioEngine';
import { useGameStore } from '@/store/gameStore';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';

/** Music for the title screen and menus outside the story. */
export const TITLE_TRACK = 'halcyon_theme';

/**
 * Connects the game to the audio engine. Music follows the saved stage state
 * (so loading and going back restore the right track); sound effects follow
 * the engine's events. Renders nothing.
 */
export function AudioDirector() {
  const inGame = useGameStore((s) => s.game !== null);
  const track = useGameStore((s) => s.game?.stage.music ?? null);
  const events = useGameStore((s) => s.events);
  const ageConfirmed = useSettings((s) => s.ageConfirmed);
  const musicVolume = useSettings((s) => s.musicVolume);
  const sfxVolume = useSettings((s) => s.sfxVolume);
  const muted = useSettings((s) => s.muted);
  const played = useRef(new WeakSet<object>());

  useEffect(() => audioEngine.setVolumes(musicVolume, sfxVolume, muted), [musicVolume, sfxVolume, muted]);

  useEffect(() => {
    const cue = events.find((e) => e.type === 'music');
    const fade = cue?.type === 'music' && cue.fade !== undefined ? cue.fade : 2;
    audioEngine.playMusic(!ageConfirmed ? null : inGame ? track : TITLE_TRACK, fade);
  }, [ageConfirmed, inGame, track, events]);

  useEffect(() => {
    if (played.current.has(events)) return; // StrictMode re-run, or no new step
    played.current.add(events);
    if (useUi.getState().skip) return; // fast-forwarding: stay quiet
    for (const e of events) if (e.type === 'sfx') audioEngine.playSfx(e.id);
  }, [events]);

  return null;
}
