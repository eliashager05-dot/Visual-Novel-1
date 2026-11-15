import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettings } from '@/store/settingsStore';

/** First-launch content notice and age confirmation. Remembered on this device. */
export function AgeGate() {
  const confirm = () => useSettings.getState().update({ ageConfirmed: true });
  const [declined, setDeclined] = useState(false);
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-black" exit={{ opacity: 0 }} transition={{ duration: 0.6 }}>
      <div className="w-[980px] text-center">
        <div className="font-serif text-[64px] text-[#f1ece2]">Before you begin</div>
        <div className="mx-auto my-8 h-px w-[200px] bg-[#e8c88f]/60" />
        {declined ? (
          <p className="text-[26px] leading-relaxed text-white/60">This game is only available to adults. Thank you for your honesty.</p>
        ) : (
          <>
            <p className="text-[25px] leading-relaxed text-white/65">
              Halcyon is a story for adults. It contains mature themes, romance, suggestive situations, strong language and
              depictions of grief. All characters are 21 years of age or older.
            </p>
            <p className="mt-6 text-[25px] text-white/65">Please confirm that you are 18 or older.</p>
            <div className="mt-14 flex justify-center gap-8">
              <button onClick={confirm} className="rounded-full bg-[#f1ece2] px-12 py-4 text-[20px] uppercase tracking-[0.3em] text-black hover:bg-white">
                I am 18 or older
              </button>
              <button
                onClick={() => setDeclined(true)}
                className="rounded-full border border-white/20 px-12 py-4 text-[20px] uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                Leave
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
