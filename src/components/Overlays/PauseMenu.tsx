import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';
import { MenuButton, Panel } from './Panel';

export function PauseMenu() {
  const ui = useUi();
  const quit = useGameStore((s) => s.quitToTitle);
  const replay = useGameStore((s) => s.mode === 'replay');
  const [confirm, setConfirm] = useState(false);
  const close = () => ui.setOverlay('none');

  return (
    <Panel title={confirm ? 'Return to title?' : replay ? 'Replay' : 'Paused'} onClose={close} width={640}>
      <div className="space-y-3 px-12 py-10">
        {confirm ? (
          <>
            <p className="mb-6 text-[22px] leading-relaxed text-white/60">
              {replay ? 'Leave this replay?' : 'Progress since your last save will be lost. Autosaves are made at each new scene and after every decision.'}
            </p>
            <MenuButton
              danger
              onClick={() => {
                ui.reset();
                quit();
              }}
            >
              Return to title
            </MenuButton>
            <MenuButton onClick={() => setConfirm(false)}>Cancel</MenuButton>
          </>
        ) : (
          <>
            <MenuButton onClick={close}>Resume</MenuButton>
            {!replay && <MenuButton onClick={() => ui.setOverlay('save')}>Save</MenuButton>}
            <MenuButton onClick={() => ui.setOverlay('load')}>Load</MenuButton>
            {!replay && <MenuButton onClick={() => ui.setOverlay('relationships')}>Relationships</MenuButton>}
            <MenuButton onClick={() => ui.setOverlay('history')}>History</MenuButton>
            <MenuButton onClick={() => ui.setOverlay('settings')}>Settings</MenuButton>
            <MenuButton danger onClick={() => setConfirm(true)}>
              Return to title
            </MenuButton>
            <p className="pt-5 text-[15px] leading-relaxed tracking-wide text-white/35">
              Click / Space — continue · Backspace — back · A — auto · S or hold Ctrl — skip · H — hide · L — history · R —
              relationships · P — phone · M — mute · F5 / F9 — quick save / load · Esc — menu
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}
