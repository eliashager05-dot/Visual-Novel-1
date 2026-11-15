import { AnimatePresence, motion } from 'framer-motion';
import { content } from '@/data';
import { cgSrc, cgVideo } from '@/lib/assetResolver';
import { MediaWithFallback } from './MediaWithFallback';
import { PlaceholderBackground } from './placeholders/PlaceholderBackground';

/** Full-frame illustration ("CG") shown above sprites. */
export function CgLayer({ id }: { id: string | null }) {
  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key={id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
        >
          <CgImage id={id} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CgImage({ id, still = false }: { id: string; still?: boolean }) {
  const def = content.cgs[id];
  if (!def) return null;
  return (
    <MediaWithFallback
      video={cgVideo(id)}
      stillOnly={still}
      src={cgSrc(id)}
      alt={def.title}
      className="absolute inset-0 h-full w-full object-cover"
      fallback={
        <div className="absolute inset-0">
          <PlaceholderBackground id={id} art={def.placeholder} />
          <div className="absolute left-1/2 top-[38%] -translate-x-1/2 text-center">
            <div className="font-serif text-6xl italic text-white/85 drop-shadow-lg">{def.title}</div>
            <div className="mt-3 text-sm uppercase tracking-[0.4em] text-white/40">Illustration</div>
          </div>
        </div>
      }
    />
  );
}
