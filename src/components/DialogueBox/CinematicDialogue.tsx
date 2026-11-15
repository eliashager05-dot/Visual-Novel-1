import { AnimatePresence, motion } from 'framer-motion';
import { useCallback } from 'react';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import type { DisplayedLine } from '@/types';
import { speakerColor } from './speakerColor';
import { Typewriter } from './Typewriter';

const SHADOW = '0 2px 4px rgba(0,0,0,0.95), 0 0 18px rgba(0,0,0,0.75)';

/**
 * Subtitle-style dialogue as used by rendered 3D visual novels: no panel,
 * centred name and text over a soft gradient, so the render stays the star.
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

  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[360px]"
        style={{ background: `linear-gradient(to top, rgba(0,0,0,${0.78 * boxOpacity}) 0%, rgba(0,0,0,${0.45 * boxOpacity}) 45%, transparent 100%)` }}
      />
      <div className={['absolute inset-x-0 bottom-[78px] flex flex-col items-center px-[260px] text-center', dimmed ? 'opacity-50' : ''].join(' ')}>
        <AnimatePresence mode="wait">
          {line.speakerName && !isNarration && (
            <motion.div
              key={line.speakerName + isThought}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mb-2 text-[34px] font-medium tracking-wide"
              style={{ color, textShadow: SHADOW }}
            >
              {line.speakerName}
              {isThought && <span className="ml-3 text-[20px] font-light italic text-white/55">(thinking)</span>}
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={[
            'min-h-[108px] max-w-[1400px]',
            isNarration ? 'font-serif text-[40px] italic leading-[1.35] text-[#efe9dd]' : 'text-[34px] leading-[1.45] text-white',
            isThought ? 'italic text-[#e4ddcf]' : '',
          ].join(' ')}
          style={{ textShadow: SHADOW }}
        >
          {dimmed ? (
            line.text
          ) : (
            <Typewriter key={lineId} text={line.text} cps={textSpeed} instant={skip} completeSignal={completeSignal} onDoneChange={onDoneChange} />
          )}
          {!dimmed && textComplete && (
            <motion.span
              className="ml-3 inline-block align-middle text-[16px]"
              style={{ color }}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, 3, 0] }}
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
