import { useUi } from '@/store/uiStore';

/** Small text buttons inside the dialogue panel. Every item here is functional. */
export function QuickMenu() {
  const { auto, skip, setAuto, setSkip, setOverlay, setHideUi } = useUi();
  const item = (label: string, onClick: () => void, active = false, hint?: string) => (
    <button
      key={label}
      title={hint}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={[
        'px-3 py-1 text-[15px] uppercase tracking-[0.22em] transition-colors',
        active ? 'text-[#e8c88f]' : 'text-white/40 hover:text-white/85',
      ].join(' ')}
    >
      {label}
    </button>
  );
  return (
    <div className="absolute bottom-[44px] right-[190px] z-10 flex gap-1">
      {item('History', () => setOverlay('history'), false, 'L / mouse wheel up')}
      {item('Auto', () => setAuto(!auto), auto, 'A')}
      {item('Skip', () => setSkip(!skip), skip, 'S / hold Ctrl — skips read text only')}
      {item('Hide', () => setHideUi(true), false, 'H / right-click')}
      {item('Menu', () => setOverlay('pause'), false, 'Esc')}
    </div>
  );
}
