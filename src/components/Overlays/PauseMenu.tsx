import { useState } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';
import { MenuButton, Panel } from './Panel';

export function PauseMenu() {
  const ui = useUi();
  const quit = useGameStore((s) => s.quitToTitle);
  const fs = useFullscreen();
  const [confirm, setConfirm] = useState(false);
  const close = () => ui.setOverlay('none');

  return (
    <Panel title={confirm ? 'Return to title?' : 'Paused'} onClose={close} width={640}>
      <div className="space-y-3 px-12 py-10">
        {confirm ? (
          <>
            <p className="mb-6 text-[22px] leading-relaxed text-white/60">
              Progress since the start of this session will be lost. Saving arrives in the next update.
            </p>
            <MenuButton danger onClick={() => { ui.reset(); quit(); }}>
              Return to title
            </MenuButton>
            <MenuButton onClick={() => setConfirm(false)}>Cancel</MenuButton>
          </>
        ) : (
          <>
            <MenuButton onClick={close}>Resume</MenuButton>
            <MenuButton onClick={() => ui.setOverlay('history')}>History</MenuButton>
            {fs.supported && (
              <MenuButton onClick={fs.toggle}>{fs.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</MenuButton>
            )}
            <MenuButton danger onClick={() => setConfirm(true)}>
              Return to title
            </MenuButton>
            <p className="pt-6 text-[15px] leading-relaxed tracking-wide text-white/35">
              Space / Enter / click — continue · A — auto · S or hold Ctrl — skip read text · H or right-click — hide
              interface · L or wheel up — history · Esc — menu
            </p>
          </>
        )}
      </div>
    </Panel>
  );
}
