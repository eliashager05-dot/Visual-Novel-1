import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { PresentedChoice } from '@/types';
import { useUi } from '@/store/uiStore';

/**
 * Centred list of options. Mouse, number keys (1–9), arrows + Enter. Locked
 * options are shown disabled with an optional hint; timed choices show a bar
 * and pick the default when time runs out.
 */
export function ChoiceMenu({ choice, onChoose }: { choice: PresentedChoice; onChoose: (id: string) => void }) {
  const enabled = choice.options.filter((o) => o.enabled);
  const [focus, setFocus] = useState(-1);
  const overlay = useUi((s) => s.overlay);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useUi.getState().overlay !== 'none') return;
      const n = Number.parseInt(e.key, 10);
      if (n >= 1 && n <= choice.options.length) {
        const o = choice.options[n - 1]!;
        if (o.enabled) onChoose(o.id);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        setFocus((f) => {
          const idx = enabled.findIndex((o) => o.id === choice.options[f]?.id);
          const next = enabled[(idx + dir + enabled.length) % enabled.length]!;
          return choice.options.findIndex((o) => o.id === next.id);
        });
      }
      if (e.key === 'Enter' && focus >= 0) {
        const o = choice.options[focus];
        if (o?.enabled) onChoose(o.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choice, enabled, focus, onChoose]);

  // Timed choices.
  useEffect(() => {
    if (!choice.timeout || overlay !== 'none') return;
    const t = setTimeout(() => onChoose(choice.timeout!.defaultOption), choice.timeout.seconds * 1000);
    return () => clearTimeout(t);
  }, [choice, overlay, onChoose]);

  return (
    <motion.div
      className="absolute right-0 top-[150px] bottom-[330px] flex flex-col items-end justify-center gap-[14px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
    >
      {choice.prompt && (
        <div className="vn-subtitle vn-outline mb-2 mr-[60px] text-[30px] font-semibold italic text-[#f3ead8]">{choice.prompt}</div>
      )}
      {choice.options.map((o, i) => (
        <motion.button
          key={o.id}
          disabled={!o.enabled}
          onClick={() => onChoose(o.id)}
          onMouseEnter={() => o.enabled && setFocus(i)}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.07 * i, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'vn-subtitle group relative flex w-[780px] items-center gap-5 rounded-l-xl py-[13px] pl-6 pr-[60px] text-left transition-all duration-150',
            o.enabled ? (focus === i ? 'text-white' : 'text-white/90') : 'cursor-not-allowed text-white/35',
          ].join(' ')}
          style={{
            background:
              focus === i && o.enabled
                ? 'linear-gradient(90deg, rgba(46,36,20,0.94) 0%, rgba(30,24,14,0.86) 70%, rgba(20,16,10,0.55) 100%)'
                : 'linear-gradient(90deg, rgba(10,10,14,0.88) 0%, rgba(10,10,14,0.78) 70%, rgba(10,10,14,0.45) 100%)',
            boxShadow: focus === i && o.enabled ? 'inset 3px 0 0 #e8c88f' : 'inset 3px 0 0 rgba(255,255,255,0.12)',
          }}
        >
          <svg viewBox="0 0 24 24" className={['h-7 w-7 shrink-0 transition-colors', focus === i && o.enabled ? 'text-[#e8c88f]' : 'text-white/55'].join(' ')} aria-hidden>
            <path d="M5 6l6.5 6L5 18M12.5 6l6.5 6-6.5 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="flex-1 text-[28px] font-semibold leading-snug">{o.text}</span>
          {!o.enabled && <span className="max-w-[240px] text-right text-[16px] italic text-white/40">{o.lockedHint ?? 'Unavailable'}</span>}
          <span className="w-5 text-center text-[16px] tabular-nums text-white/30">{i + 1}</span>
        </motion.button>
      ))}
      {choice.timeout && (
        <div className="mr-[60px] mt-2 h-[3px] w-[720px] overflow-hidden rounded bg-white/15">
          <motion.div
            className="h-full bg-[#e8c88f]"
            initial={{ width: '100%' }}
            animate={{ width: overlay === 'none' ? '0%' : undefined }}
            transition={{ duration: choice.timeout.seconds, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}
