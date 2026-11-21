import { motion } from 'framer-motion';
import { useState } from 'react';
import { contactName } from '@/engine';
import { sceneManager, useGameStore } from '@/store/gameStore';
import { useUi } from '@/store/uiStore';
import { Avatar, MessageList, PhoneShell } from './PhoneShell';

/** The phone as an app (HUD icon or P): read any conversation so far. */
export function PhoneApp() {
  const game = useGameStore((s) => s.game);
  const markRead = useGameStore((s) => s.markThreadRead);
  const [open, setOpen] = useState<string | null>(null);
  const close = () => useUi.getState().setOverlay('none');
  if (!game) return null;
  // Most recently started conversations first.
  const threads = Object.keys(game.phone.threads).reverse();

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) close();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <motion.div className="h-[900px] w-[540px]" initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        {open ? (
          <PhoneShell name={contactName(sceneManager, game, open)} thread={open} onBack={() => setOpen(null)}>
            <MessageList messages={game.phone.threads[open] ?? []} />
          </PhoneShell>
        ) : (
          <PhoneShell name="Messages" thread={null}>
            <div className="flex-1 overflow-y-auto">
              {threads.length === 0 && <p className="px-6 py-10 text-[19px] text-white/40">No messages yet.</p>}
              {threads.map((t) => {
                const msgs = game.phone.threads[t] ?? [];
                const last = msgs[msgs.length - 1];
                const unread = game.phone.unread[t] ?? 0;
                return (
                  <button
                    key={t}
                    onClick={() => {
                      setOpen(t);
                      markRead(t);
                    }}
                    className="flex w-full items-center gap-4 border-b border-white/[0.05] px-5 py-4 text-left hover:bg-white/[0.04]"
                  >
                    <Avatar thread={t} size={56} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[20px] font-semibold text-white/90">{contactName(sceneManager, game, t)}</div>
                      <div className="truncate text-[17px] text-white/45">
                        {last ? `${last.from === 'player' ? 'You: ' : ''}${last.text ?? 'Photo'}` : ''}
                      </div>
                    </div>
                    {unread > 0 && (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#e8c88f] px-2 text-[15px] font-bold text-black">{unread}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button onClick={close} className="border-t border-white/[0.07] py-4 text-[17px] uppercase tracking-[0.25em] text-white/50 hover:text-white">
              Close · Esc
            </button>
          </PhoneShell>
        )}
      </motion.div>
    </motion.div>
  );
}
