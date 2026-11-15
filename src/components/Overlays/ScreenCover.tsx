import { AnimatePresence, motion } from 'framer-motion';
import type { Cover } from '@/hooks/useDeferredView';

/** Full-screen colour cover for fade/black/white transitions, plus flashes. */
export function ScreenCover({ cover, flashKey }: { cover: Cover | null; flashKey: number }) {
  return (
    <>
      {cover && (
        <motion.div
          key={cover.key}
          className="absolute inset-0 z-40"
          style={{ background: cover.color }}
          initial={{ opacity: cover.phase === 'in' ? 0 : 1 }}
          animate={{ opacity: cover.phase === 'in' ? 1 : 0 }}
          transition={{ duration: cover.duration, ease: 'easeInOut' }}
        />
      )}
      <AnimatePresence>
        {flashKey > 0 && (
          <motion.div
            key={flashKey}
            className="pointer-events-none absolute inset-0 z-40 bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
