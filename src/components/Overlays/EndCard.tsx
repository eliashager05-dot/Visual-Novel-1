import { motion } from 'framer-motion';
import { content } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';

export function EndCard({ ending, nextChapter }: { ending?: string; nextChapter?: string }) {
  const quit = useGameStore((s) => s.quitToTitle);
  const scene = useGameStore((s) => s.game?.pointer.scene);
  const chapter = content.chapters.find((c) => c.id === (scene && content.scenes[scene]?.chapter));
  const heading = ending ? 'An ending' : nextChapter && chapter ? `End of ${chapter.title}` : 'To be continued';

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.6 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-serif text-[84px] italic text-[#f1ece2]">{heading}</div>
      <div className="my-8 h-px w-[220px] bg-[#e8c88f]/60" />
      <p className="max-w-[900px] text-center text-[22px] leading-relaxed text-white/55">
        {ending
          ? 'Your choices led here. Other paths remain.'
          : 'The story continues in the next update. Your choices so far will matter.'}
      </p>
      <button
        onClick={() => {
          useUi.getState().reset();
          quit();
        }}
        className="mt-14 rounded-full border border-white/20 px-12 py-4 text-[20px] uppercase tracking-[0.3em] text-white/80 hover:border-[#e8c88f]/60 hover:text-white"
      >
        Return to title
      </button>
    </motion.div>
  );
}
