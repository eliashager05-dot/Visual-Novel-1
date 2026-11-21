import { AnimatePresence, motion } from 'framer-motion';
import { dayLabel, periodLabel } from '@/lib/clock';
import type { GameClock, TimeOfDay } from '@/types';

const ICON: Record<TimeOfDay, 'sun' | 'moon' | 'half'> = {
  dawn: 'half',
  morning: 'sun',
  midday: 'sun',
  afternoon: 'sun',
  dusk: 'half',
  evening: 'moon',
  night: 'moon',
  late: 'moon',
};

/**
 * Day and time of day in the top-left corner. When the time changes the old
 * label slides away and the new one settles in, with a brief gold glow.
 */
export function ClockChip({ clock }: { clock: GameClock }) {
  const key = `${clock.day}-${clock.period}`;
  return (
    <div className="pointer-events-none absolute left-[44px] top-[30px] z-20 h-[50px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          data-clock={key}
          className="flex items-center gap-3 rounded-full bg-black/35 py-2 pl-3 pr-5 backdrop-blur-sm"
          initial={{ opacity: 0, y: -10, boxShadow: '0 0 0 1px rgba(232,200,143,0.9), 0 0 26px rgba(232,200,143,0.55)' }}
          animate={{ opacity: 1, y: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 0 0px rgba(232,200,143,0)' }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.5, boxShadow: { duration: 2.4 } }}
        >
          <TimeIcon kind={ICON[clock.period]} />
          <span className="text-[16px] font-semibold uppercase tracking-[0.28em] text-[#e8c88f]/90">{dayLabel(clock.day)}</span>
          <span className="h-4 w-px bg-white/25" />
          <span className="font-serif text-[22px] italic text-white/85">{periodLabel(clock.period)}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TimeIcon({ kind }: { kind: 'sun' | 'moon' | 'half' }) {
  const s = { fill: 'none', stroke: '#e8c88f', strokeWidth: 1.9, strokeLinecap: 'round' } as const;
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      {kind === 'sun' && (
        <g {...s}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
        </g>
      )}
      {kind === 'moon' && <path {...s} d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z" />}
      {kind === 'half' && (
        <g {...s}>
          <path d="M6 16a6 6 0 0 1 12 0" />
          <path d="M2.5 16h19M12 6.5V8.5M5.5 9.5l1.4 1.4M18.5 9.5l-1.4 1.4M4 20h16" />
        </g>
      )}
    </svg>
  );
}
