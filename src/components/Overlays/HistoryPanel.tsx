import { useEffect, useRef } from 'react';
import { content } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';
import { Panel } from './Panel';

export function HistoryPanel() {
  const history = useGameStore((s) => s.game?.history ?? []);
  const close = () => useUi.getState().setOverlay('none');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, []);

  return (
    <Panel title="History" onClose={close}>
      <div className="overflow-y-auto px-12 py-8" onWheel={(e) => e.stopPropagation()}>
        {history.length === 0 && <p className="text-[22px] text-white/40">Nothing yet.</p>}
        <ol className="space-y-6">
          {history.map((h, i) => {
            const color = h.speaker && h.speaker !== 'player' ? content.characters[h.speaker]?.color : '#e9e4da';
            if (h.kind === 'choice') {
              return (
                <li key={i} className="flex items-center gap-4 border-l-2 border-[#e8c88f]/60 pl-5 text-[22px] text-[#e8c88f]">
                  <span className="text-[14px] uppercase tracking-[0.3em] text-[#e8c88f]/60">You chose</span>
                  {h.text}
                </li>
              );
            }
            return (
              <li key={i} className="grid grid-cols-[200px_1fr] gap-6">
                <span className="pt-1 text-right font-serif text-[24px]" style={{ color }}>
                  {h.kind === 'narrate' ? '' : h.speakerName}
                  {h.kind === 'text' && <span className="block text-[13px] uppercase tracking-[0.25em] text-white/35">message</span>}
                </span>
                <span
                  className={[
                    'text-[22px] leading-relaxed',
                    h.kind === 'say' ? 'text-white/85' : 'font-serif italic text-white/65',
                  ].join(' ')}
                >
                  {h.text}
                </span>
              </li>
            );
          })}
        </ol>
        <div ref={end} />
      </div>
    </Panel>
  );
}
