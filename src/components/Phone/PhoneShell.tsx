import { motion } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import { content } from '@/data';
import { phoneTime } from '@/lib/clock';
import { useGameStore } from '@/store/gameStore';
import type { PhoneMessage } from '@/types';
import { CharacterPortrait } from '../CharacterRenderer/CharacterPortrait';
import { StageThumbnail } from '../Stage/StageThumbnail';

/** The handset itself: frame, status bar and a header with the contact. */
export function PhoneShell({ name, thread, children, onBack }: { name: string; thread: string | null; children: ReactNode; onBack?: () => void }) {
  const time = phoneTime(useGameStore((s) => s.game?.clock ?? null));
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[52px] border-[10px] border-[#14151a] bg-[#0b0c10] shadow-[0_30px_90px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
      <div className="flex items-center justify-between px-8 pb-1 pt-4 text-[15px] font-semibold text-white/80">
        <span className="w-[60px]">{time}</span>
        <span className="h-[26px] w-[110px] rounded-full bg-black" />
        <span className="w-[60px] text-right tracking-widest">▮▮▮</span>
      </div>
      <div className="flex items-center gap-4 border-b border-white/[0.07] px-5 pb-3 pt-2">
        {onBack && (
          <button onClick={onBack} className="text-[30px] leading-none text-[#e8c88f]" aria-label="Back">
            ‹
          </button>
        )}
        {thread && <Avatar thread={thread} size={48} />}
        <div className="truncate text-[22px] font-semibold text-white/90">{name}</div>
      </div>
      {children}
    </div>
  );
}

export function Avatar({ thread, size }: { thread: string; size: number }) {
  // While a character still texts under an alias ("Unknown number") the
  // avatar must not give their face away.
  const masked = useGameStore((s) => Boolean(s.game?.phone.names[thread]));
  const def = content.characters[thread];
  if (def && !masked) {
    return (
      <div className="shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
        <CharacterPortrait id={thread} size={size} />
      </div>
    );
  }
  const contact = content.contacts[thread];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-[20px] font-semibold text-black/70"
      style={{ width: size, height: size, background: contact?.color ?? '#8a8f99' }}
    >
      {contact || masked ? '?' : thread.slice(0, 1).toUpperCase()}
    </div>
  );
}

/** Message bubbles, newest at the bottom; the newest can animate in. */
export function MessageList({ messages, animateLast = false }: { messages: PhoneMessage[]; animateLast?: boolean }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5" onWheel={(e) => e.stopPropagation()}>
      {messages.map((m, i) => {
        const mine = m.from === 'player';
        const last = i === messages.length - 1;
        return (
          <motion.div
            key={i}
            initial={animateLast && last ? { opacity: 0, y: 14, scale: 0.97 } : false}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={['flex flex-col gap-1.5', mine ? 'items-end' : 'items-start'].join(' ')}
          >
            {m.image && (
              <div className="overflow-hidden rounded-[18px] ring-1 ring-white/10">
                <StageThumbnail thumb={content.cgs[m.image] ? { cg: m.image, shot: null, background: null, characters: [] } : { shot: m.image, cg: null, background: null, characters: [] }} width={360} />
              </div>
            )}
            {m.text && (
              <div
                className={[
                  'max-w-[400px] rounded-[22px] px-5 py-3 text-[21px] leading-snug',
                  mine ? 'rounded-br-[6px] bg-[#e8c88f] text-[#16130d]' : 'rounded-bl-[6px] bg-[#262933] text-white/90',
                ].join(' ')}
              >
                {m.text}
              </div>
            )}
          </motion.div>
        );
      })}
      <div ref={end} />
    </div>
  );
}
