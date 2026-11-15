import { AnimatePresence, motion } from 'framer-motion';
import { content } from '@/data';
import { backgroundSrc } from '@/lib/assetResolver';
import { ImageWithFallback } from './ImageWithFallback';
import { PlaceholderBackground } from './placeholders/PlaceholderBackground';

/** Cross-dissolves between backgrounds, with a slow cinematic drift. */
export function BackgroundLayer({ id }: { id: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {id && (
        <motion.div
          key={id}
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          <motion.div
            className="absolute -inset-[2%]"
            animate={{ scale: [1, 1.035], x: [0, -14] }}
            transition={{ duration: 40, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
          >
            <BackgroundImage id={id} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BackgroundImage({ id }: { id: string }) {
  const def = content.backgrounds[id];
  if (!def) return <div className="absolute inset-0 bg-neutral-900" />;
  return (
    <ImageWithFallback
      src={backgroundSrc(id)}
      alt={def.name}
      className="absolute inset-0 h-full w-full object-cover"
      fallback={<PlaceholderBackground id={id} art={def.placeholder} />}
    />
  );
}
