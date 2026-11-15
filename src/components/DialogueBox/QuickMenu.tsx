import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';

/** Small text buttons along the bottom. Every item here is functional. */
export function QuickMenu({ cinematic = false }: { cinematic?: boolean }) {
  const { auto, skip, setAuto, setSkip, setOverlay, setHideUi } = useUi();
  const canRollback = useGameStore((s) => s.past.length > 0);
  const rollback = useGameStore((s) => s.rollback);
  const quickSave = useGameStore((s) => s.quickSave);
  const replay = useGameStore((s) => s.mode === 'replay');

  const item = (label: string, onClick: () => void, opts: { active?: boolean; hint?: string; disabled?: boolean } = {}) => (
    <button
      key={label}
      title={opts.hint}
      disabled={opts.disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={[
        'px-3 py-1 text-[15px] uppercase tracking-[0.22em] transition-colors disabled:opacity-25',
        opts.active ? 'text-[#e8c88f]' : 'text-white/40 hover:text-white/85',
      ].join(' ')}
    >
      {label}
    </button>
  );
  return (
    <div className={['absolute z-10 flex gap-1', cinematic ? 'bottom-[18px] right-[40px]' : 'bottom-[44px] right-[190px]'].join(' ')}>
      {item('Back', rollback, { disabled: !canRollback, hint: 'Backspace — previous line' })}
      {item('History', () => setOverlay('history'), { hint: 'L / mouse wheel up' })}
      {item('Auto', () => setAuto(!auto), { active: auto, hint: 'A' })}
      {item('Skip', () => setSkip(!skip), { active: skip, hint: 'S / hold Ctrl — skips read text' })}
      {!replay && item('Save', () => setOverlay('save'), { hint: 'F5 for quick save' })}
      {!replay && item('Q.Save', quickSave, { hint: 'F5' })}
      {item('Load', () => setOverlay('load'), { hint: 'F9 for quick load' })}
      {item('Hide', () => setHideUi(true), { hint: 'H / right-click' })}
      {item('Menu', () => setOverlay('pause'), { hint: 'Esc' })}
    </div>
  );
}
