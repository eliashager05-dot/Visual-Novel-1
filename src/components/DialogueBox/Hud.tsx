import type { ReactNode } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';

/**
 * In-game controls as icons, kept to the corners so the render stays clear:
 * system actions top-right, reading controls bottom-right. Every button works.
 */

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONS: Record<string, ReactNode> = {
  history: (
    <g {...stroke}>
      <path d="M4 5.5h16v10.5H11l-4.5 3.5V16H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </g>
  ),
  hide: (
    <g {...stroke}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M4 20 20 4" />
    </g>
  ),
  save: (
    <g {...stroke}>
      <path d="M12 3.5v10M8 10l4 4 4-4" />
      <path d="M4 14.5v5h16v-5" />
    </g>
  ),
  load: (
    <g {...stroke}>
      <path d="M12 14V4M8 7.5l4-4 4 4" />
      <path d="M4 14.5v5h16v-5" />
    </g>
  ),
  relationships: (
    <g {...stroke}>
      <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
    </g>
  ),
  menu: (
    <g {...stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 9.5h8M8 12h8M8 14.5h8" />
    </g>
  ),
  back: (
    <g {...stroke}>
      <path d="M14.5 5.5 8 12l6.5 6.5" />
      <path d="M8.5 12H19" />
    </g>
  ),
  auto: (
    <g {...stroke}>
      <path d="M7.5 5.5v13l11-6.5z" />
    </g>
  ),
  skip: (
    <g {...stroke}>
      <path d="M5 6l6.5 6L5 18M12.5 6l6.5 6-6.5 6" />
    </g>
  ),
};

function IconButton({
  icon,
  label,
  hint,
  onClick,
  active = false,
  disabled = false,
}: {
  icon: keyof typeof ICONS;
  label: string;
  hint?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={hint ? `${label} (${hint})` : label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={[
        'flex h-[54px] w-[54px] items-center justify-center rounded-full transition-all duration-150 disabled:opacity-25',
        active ? 'text-[#e8c88f]' : 'text-white/85 hover:scale-110 hover:text-white',
      ].join(' ')}
      style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.95)) drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}
    >
      <svg viewBox="0 0 24 24" className="h-[38px] w-[38px]" aria-hidden>
        {ICONS[icon]}
      </svg>
    </button>
  );
}

export function Hud({ raised = false }: { raised?: boolean }) {
  const { auto, skip, setAuto, setSkip, setOverlay, setHideUi } = useUi();
  const canRollback = useGameStore((s) => s.past.length > 0);
  const rollback = useGameStore((s) => s.rollback);
  const replay = useGameStore((s) => s.mode === 'replay');

  return (
    <>
      <div className="absolute right-[36px] top-[22px] z-10 flex gap-2">
        <IconButton icon="history" label="History" hint="L" onClick={() => setOverlay('history')} />
        <IconButton icon="hide" label="Hide interface" hint="H / right-click" onClick={() => setHideUi(true)} />
        {!replay && <IconButton icon="save" label="Save" hint="F5 quick save" onClick={() => setOverlay('save')} />}
        <IconButton icon="load" label="Load" hint="F9 quick load" onClick={() => setOverlay('load')} />
        {!replay && <IconButton icon="relationships" label="Relationships" hint="R" onClick={() => setOverlay('relationships')} />}
        <IconButton icon="menu" label="Menu" hint="Esc" onClick={() => setOverlay('pause')} />
      </div>
      <div className={['absolute right-[36px] z-10 flex gap-2', raised ? 'bottom-[296px]' : 'bottom-[26px]'].join(' ')}>
        <IconButton icon="back" label="Back" hint="Backspace" onClick={rollback} disabled={!canRollback} />
        <IconButton icon="auto" label="Auto-play" hint="A" onClick={() => setAuto(!auto)} active={auto} />
        <IconButton icon="skip" label="Skip read text" hint="S / hold Ctrl" onClick={() => setSkip(!skip)} active={skip} />
      </div>
    </>
  );
}
