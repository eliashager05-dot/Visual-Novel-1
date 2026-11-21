import { AnimatePresence, motion } from 'framer-motion';
import { contactName } from '@/engine';
import { sceneManager, useGameStore } from '@/store/gameStore';
import { MessageList, PhoneShell } from './PhoneShell';

/** Where the in-story phone sits on the 1920×1080 canvas. Subtitles keep to the left of it. */
export const PHONE_BOX = { right: 110, top: 70, width: 540, height: 860 };

/** The phone during the story: the open conversation, with the newest message arriving. */
export function PhoneView({ thread, replying }: { thread: string | null; replying: boolean }) {
  const game = useGameStore((s) => s.game);
  return (
    <AnimatePresence>
      {thread && game && (
        <motion.div
          key="phone"
          className="absolute z-20"
          style={PHONE_BOX}
          initial={{ opacity: 0, y: 90, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, y: 90, rotate: 2 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => replying && e.stopPropagation()}
        >
          <PhoneShell name={contactName(sceneManager, game, thread)} thread={thread}>
            <MessageList messages={game.phone.threads[thread] ?? []} animateLast />
            {/* Room for reply options, which the choice menu draws over this area. */}
            {replying && <div className="h-[230px] shrink-0 border-t border-white/[0.07] bg-black/30" />}
          </PhoneShell>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
