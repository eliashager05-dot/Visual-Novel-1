import { AnimatePresence, motion } from 'framer-motion';
import { useCallback } from 'react';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import type { DisplayedLine } from '@/types';
import { speakerColor } from './speakerColor';
import { Typewriter } from './Typewriter';

/**
 * Subtitle-style dialogue for rendered scenes: no panel, a coloured name and
 * heavily outlined text, so it stays readable over any photoreal image while
 * covering as little of it as possible. Thoughts are shown in parentheses.
 */
export function CinematicDialogue({ line, lineId, dimmed = false }: { line: DisplayedLine; lineId: number; dimmed?: boolean }) {
  const { textSpeed, boxOpacity } = useSettings();
  const skip = useUi((s) => s.skip);
  const completeSignal = useUi((s) => s.completeSignal);
  const textComplete = useUi((s) => s.textComplete);
  const setTextComplete = useUi((s) => s.setTextComplete);
  const onDoneChange = useCallback((d: boolean) => setTextComplete(d), [setTextComplete]);
  const color = speakerColor(line);
  const isNarration = line.kind === 'narrate';
  const isThought = line.kind === 'think';
  const text = isThought ? `(${line.text})` : line.text;

  return (
    <>
      {/* Optional soft darkening behind the text (Settings → Text background). */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[330px]"
        style={{ background: `linear-gradient(to top, rgba(0,0,0,${0.7 * boxOpacity}) 0%, rgba(0,0,0,${0.35 * boxOpacity}) 50%, transparent 100%)` }}
      />
      <div className={['vn-subtitle absolute inset-x-0 bottom-[96px] flex flex-col items-center px-[250px] text-center', dimmed ? 'opacity-55' : ''].join(' ')}>
        <AnimatePresence mode="wait">
          {line.speakerName && !isNarration && (
            <motion.div
              key={line.speakerName}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16 }}
              className="vn-outline mb-1 text-[38px] font-bold leading-tight"
              style={{ color }}
            >
              {line.speakerName}
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={[
            'vn-outline min-h-[112px] max-w-[1420px] text-[38px] font-semibold leading-[1.42]',
            isNarration ? 'italic text-[#f3ead8]' : 'text-white',
          ].join(' ')}
        >
          {dimmed ? (
            text
          ) : (
            <Typewriter key={lineId} text={text} cps={textSpeed} instant={skip} completeSignal={completeSignal} onDoneChange={onDoneChange} />
          )}
          {!dimmed && textComplete && (
            <motion.span
              className="ml-3 inline-block align-middle text-[18px]"
              style={{ color, WebkitTextStroke: '0' }}
              animate={{ opacity: [0.35, 1, 0.35], y: [0, 3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              aria-hidden
            >
              ▼
            </motion.span>
          )}
        </div>
      </div>
    </>
  );
}
