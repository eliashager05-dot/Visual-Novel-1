import { AnimatePresence, motion } from 'framer-motion';
import { useCallback } from 'react';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import type { DisplayedLine } from '@/types';
import { speakerColor } from './speakerColor';
import { Typewriter } from './Typewriter';


/**
 * Bottom dialogue panel. Narration is set in serif italics without a name
 * plate; inner thoughts are italic with the player's name; speech is upright.
 * `static` renders a faded, non-typing line (used behind choices).
 */
export function DialogueBox({
  line,
  lineId,
  dimmed = false,
}: {
  line: DisplayedLine;
  /** Changes whenever a new line is shown, even if text repeats. */
  lineId: number;
  dimmed?: boolean;
}) {
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
    <div className="absolute inset-x-[150px] bottom-[34px] h-[248px]">
      <div
        className="absolute inset-0 rounded-[28px] border border-white/[0.07] shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-md"
        style={{
          background: `linear-gradient(180deg, rgba(10,12,18,${0.5 + boxOpacity * 0.4}) 0%, rgba(6,7,11,${0.6 + boxOpacity * 0.4}) 100%)`,
          opacity: dimmed ? 0.55 : 1,
        }}
      />
      {/* Accent hairline in the speaker's colour */}
      <div
        className="absolute left-12 right-12 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}88, transparent)` }}
      />

      <AnimatePresence mode="wait">
        {line.speakerName && !isNarration && (
          <motion.div
            key={line.speakerName}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            className="absolute -top-[30px] left-[56px] flex items-end gap-3"
          >
            <span
              className="font-serif text-[46px] font-semibold leading-none tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
              style={{ color }}
            >
              {line.speakerName}
            </span>
            {isThought && <span className="mb-1 text-[15px] uppercase tracking-[0.3em] text-white/40">thinking</span>}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={[
          'absolute inset-x-[56px] top-[46px] bottom-[52px] overflow-hidden',
          isNarration ? 'font-serif text-[34px] italic leading-[1.45] text-[#e8e2d6]' : 'text-[29px] leading-[1.55] text-[#f2efe9]',
          isThought ? 'italic text-[#d9d3c6]' : '',
          dimmed ? 'opacity-60' : '',
        ].join(' ')}
      >
        {dimmed ? (
          line.text
        ) : (
          <Typewriter
            key={lineId}
            text={line.text}
            cps={textSpeed}
            instant={skip}
            completeSignal={completeSignal}
            onDoneChange={onDoneChange}
          />
        )}
        {!dimmed && textComplete && (
          <motion.span
            className="ml-3 inline-block align-middle text-[18px]"
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
  );
}
