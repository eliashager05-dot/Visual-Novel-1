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
      className="absolute inset-x-0 top-[150px] bottom-[300px] flex flex-col items-center justify-center gap-[18px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => e.stopPropagation()}
    >
      {choice.prompt && (
        <div className="mb-3 font-serif text-[34px] italic text-white/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          {choice.prompt}
        </div>
      )}
      {choice.options.map((o, i) => (
        <motion.button
          key={o.id}
          disabled={!o.enabled}
          onClick={() => onChoose(o.id)}
          onMouseEnter={() => o.enabled && setFocus(i)}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={[
            'group relative flex w-[960px] items-center gap-6 rounded-2xl border px-8 py-[18px] text-left backdrop-blur-md transition-colors duration-200',
            o.enabled
              ? focus === i
                ? 'border-[#e8c88f]/60 bg-[rgba(30,24,16,0.88)] text-white'
                : 'border-white/10 bg-[rgba(8,10,15,0.78)] text-white/90 hover:border-[#e8c88f]/50'
              : 'cursor-not-allowed border-white/5 bg-[rgba(8,10,15,0.5)] text-white/30',
          ].join(' ')}
        >
          <span
            className={[
              'w-6 text-center text-[20px] font-light tabular-nums',
              focus === i && o.enabled ? 'text-[#e8c88f]' : 'text-white/30',
            ].join(' ')}
          >
            {i + 1}
          </span>
          <span className="flex-1 text-[28px] leading-snug">{o.text}</span>
          {!o.enabled && <span className="text-[16px] italic text-white/35">{o.lockedHint ?? 'Unavailable'}</span>}
        </motion.button>
      ))}
      {choice.timeout && (
        <div className="mt-2 h-[3px] w-[960px] overflow-hidden rounded bg-white/10">
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
