import { useState } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useGameStore } from '@/store/gameStore';
import { usePersistentStore } from '@/store/persistentStore';
import { saveRepo, useSaves } from '@/store/saveStore';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import { Typewriter } from '../DialogueBox/Typewriter';
import { Panel } from '../Overlays/Panel';
import { ConfirmBar, Field, Segmented, Slider, Tabs, Toggle } from '../ui/controls';

type Tab = 'text' | 'audio' | 'gameplay' | 'display' | 'data';

const SAMPLE = 'The island rises out of the haze — a dark hump of rock, a lighthouse, a scatter of lit windows.';

export function SettingsScreen({ onClose }: { onClose: () => void }) {
  const s = useSettings();
  const fs = useFullscreen();
  const inGame = useGameStore((g) => g.game !== null);
  const [tab, setTab] = useState<Tab>('text');
  const [confirm, setConfirm] = useState<null | 'settings' | 'erase'>(null);
  const [previewKey, setPreviewKey] = useState(0);

  return (
    <Panel title="Settings" onClose={onClose} width={1240}>
      <Tabs
        value={tab}
        onChange={(t) => {
          setTab(t);
          setConfirm(null);
        }}
        tabs={[
          { value: 'text', label: 'Text' },
          { value: 'audio', label: 'Audio' },
          { value: 'gameplay', label: 'Gameplay' },
          { value: 'display', label: 'Display' },
          { value: 'data', label: 'Data' },
        ]}
      />
      <div className="min-h-[560px] divide-y divide-white/[0.05] overflow-y-auto px-12 py-6">
        {tab === 'text' && (
          <>
            <Field label="Text speed" hint="Characters per second. Far right shows lines instantly.">
              <Slider
                label="Text speed"
                value={s.textSpeed === 0 ? 160 : s.textSpeed}
                min={10}
                max={160}
                step={5}
                format={(v) => (v >= 160 ? 'Instant' : `${v} / s`)}
                onChange={(v) => {
                  s.update({ textSpeed: v >= 160 ? 0 : v });
                  setPreviewKey((k) => k + 1);
                }}
              />
            </Field>
            <Field label="Preview">
              <div className="min-h-[70px] text-[22px] leading-snug text-white/80">
                <Typewriter key={previewKey} text={SAMPLE} cps={s.textSpeed} instant={false} completeSignal={0} onDoneChange={() => {}} />
              </div>
            </Field>
            <Field label="Auto-play speed" hint="Pause after each line in auto mode (longer lines wait a little more).">
              <Slider
                label="Auto-play delay"
                value={s.autoDelay}
                min={300}
                max={4000}
                step={100}
                format={(v) => `${(v / 1000).toFixed(1)} s`}
                onChange={(v) => s.update({ autoDelay: v })}
              />
            </Field>
            <Field label="Dialogue style" hint="Cinematic subtitles over the image, or a classic text panel.">
              <Segmented
                value={s.dialogueStyle}
                onChange={(v) => s.update({ dialogueStyle: v })}
                options={[
                  { value: 'cinematic', label: 'Cinematic' },
                  { value: 'panel', label: 'Panel' },
                ]}
              />
            </Field>
            <Field label="Text background" hint="Darkness behind dialogue text, for readability.">
              <Slider
                label="Text background opacity"
                value={Math.round(s.boxOpacity * 100)}
                min={30}
                max={100}
                step={5}
                format={(v) => `${v}%`}
                onChange={(v) => s.update({ boxOpacity: v / 100 })}
              />
            </Field>
          </>
        )}

        {tab === 'audio' && (
          <>
            <Field label="Music volume">
              <Slider label="Music volume" value={Math.round(s.musicVolume * 100)} min={0} max={100} step={5} format={(v) => `${v}%`} onChange={(v) => s.update({ musicVolume: v / 100 })} />
            </Field>
            <Field label="Sound effects volume">
              <Slider label="Sound effects volume" value={Math.round(s.sfxVolume * 100)} min={0} max={100} step={5} format={(v) => `${v}%`} onChange={(v) => s.update({ sfxVolume: v / 100 })} />
            </Field>
            <Field label="Mute all" hint="Also on the speaker icon in the game, or the M key.">
              <Toggle label="Mute all" value={s.muted} onChange={(v) => s.update({ muted: v })} />
            </Field>
            <p className="pt-5 text-[15px] leading-relaxed text-white/40">
              Music plays from files in <code>src/assets/music</code>; until a track is added it stays silent. Sound
              effects without a file use simple synthesised placeholders.
            </p>
          </>
        )}

        {tab === 'gameplay' && (
          <>
            <Field label="Skip unread text" hint="When off, skip mode stops at lines you haven't read yet.">
              <Toggle label="Skip unread text" value={s.skipUnread} onChange={(v) => s.update({ skipUnread: v })} />
            </Field>
            <Field label="Relationship notices" hint={'Short notes such as "Vera will remember that." after important choices.'}>
              <Toggle label="Relationship notices" value={s.relationshipNotices} onChange={(v) => s.update({ relationshipNotices: v })} />
            </Field>
          </>
        )}

        {tab === 'display' && (
          <>
            {fs.supported ? (
              <Field label="Fullscreen">
                <Toggle label="Fullscreen" value={fs.isFullscreen} onChange={() => void fs.toggle()} />
              </Field>
            ) : (
              <Field label="Fullscreen" hint="Not available in this browser or embedded view.">
                <span className="text-white/40">Unavailable</span>
              </Field>
            )}
            <Field label="Animated scenes" hint="Play animated clips where a scene has one. Turn off to always show the still image.">
              <Toggle label="Animated scenes" value={s.animations} onChange={(v) => s.update({ animations: v })} />
            </Field>
          </>
        )}

        {tab === 'data' && (
          <>
            <Field label="Reset settings" hint="Restore all options on this screen to their defaults.">
              <button
                onClick={() => setConfirm('settings')}
                className="rounded-full border border-white/15 px-6 py-2 text-[17px] text-white/75 hover:border-white/40"
              >
                Reset settings
              </button>
            </Field>
            <Field
              label="Erase all progress"
              hint="Deletes every save, autosave, read-text history and gallery unlock on this device. Cannot be undone."
            >
              <button
                disabled={inGame}
                onClick={() => setConfirm('erase')}
                className="rounded-full border border-red-300/20 px-6 py-2 text-[17px] text-red-200/80 hover:border-red-300/50 disabled:opacity-40"
              >
                Erase everything
              </button>
              {inGame && <div className="mt-2 text-[14px] text-white/35">Return to the title screen first.</div>}
            </Field>
            {confirm && (
              <div className="pt-6">
                <ConfirmBar
                  text={confirm === 'settings' ? 'Reset all settings to defaults?' : 'Erase all saves and progress permanently?'}
                  confirmLabel={confirm === 'settings' ? 'Reset' : 'Erase'}
                  onCancel={() => setConfirm(null)}
                  onConfirm={() => {
                    if (confirm === 'settings') s.reset();
                    else {
                      saveRepo.clearAll();
                      useSaves.getState().refresh();
                      usePersistentStore.getState().resetProgress();
                    }
                    useUi.getState().pushToast({ tone: 'info', text: confirm === 'settings' ? 'Settings reset' : 'All progress erased' });
                    setConfirm(null);
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Panel>
  );
}
