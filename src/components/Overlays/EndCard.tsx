import { motion } from 'framer-motion';
import { content } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';

export function EndCard({ ending, nextChapter, chapterComplete }: { ending?: string; nextChapter?: string; chapterComplete?: boolean }) {
  const quit = useGameStore((s) => s.quitToTitle);
  const continueChapter = useGameStore((s) => s.continueChapter);
  const replay = useGameStore((s) => s.mode === 'replay');
  const scene = useGameStore((s) => s.game?.pointer.scene);
  const chapter = content.chapters.find((c) => c.id === (scene && content.scenes[scene]?.chapter));
  const next = !replay && nextChapter ? content.chapters.find((c) => c.id === nextChapter) : undefined;
  const heading = replay ? 'End of replay' : ending ? 'An ending' : (nextChapter || chapterComplete) && chapter ? `End of ${chapter.title}` : 'To be continued';

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
        {replay
          ? 'Replays never affect your saves.'
          : ending
            ? 'Your choices led here. Other paths remain.'
            : next
              ? 'Every choice you made in this chapter carries forward.'
              : chapterComplete
              ? 'To be continued. Every choice you made in this chapter will carry forward.'
              : 'The story continues in the next update. Your choices so far will matter.'}
      </p>
      <div className="mt-14 flex items-center gap-6">
        {next && (
          <button
            onClick={() => {
              useUi.getState().reset();
              continueChapter();
            }}
            className="rounded-full border border-[#e8c88f]/70 bg-[#e8c88f]/10 px-12 py-4 text-[20px] uppercase tracking-[0.3em] text-[#f0d49a] hover:bg-[#e8c88f]/20"
          >
            Continue to {next.title}
            {next.subtitle && <span className="ml-3 font-serif text-[22px] normal-case italic tracking-normal opacity-80">{next.subtitle}</span>}
          </button>
        )}
        <button
          onClick={() => {
            useUi.getState().reset();
            quit();
            if (replay) useUi.getState().setMenuScreen('gallery');
          }}
          className="rounded-full border border-white/20 px-12 py-4 text-[20px] uppercase tracking-[0.3em] text-white/80 hover:border-[#e8c88f]/60 hover:text-white"
        >
          {replay ? 'Return to gallery' : 'Return to title'}
        </button>
      </div>
    </motion.div>
  );
}
