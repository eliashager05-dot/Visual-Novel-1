import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Shared shell for full-screen menus: dimmed blurred backdrop + title. */
export function Panel({ title, onClose, children, width = 1100 }: { title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <motion.div
        className="flex max-h-[1030px] flex-col rounded-[28px] border border-white/10 bg-[rgba(10,11,16,0.92)] shadow-2xl"
        style={{ width }}
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-12 py-7">
          <h2 className="font-serif text-[44px] tracking-wide text-[#f1ece2]">{title}</h2>
          <button onClick={onClose} className="text-[16px] uppercase tracking-[0.25em] text-white/40 hover:text-white">
            Close · Esc
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function MenuButton({ children, onClick, danger = false }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={[
        'w-full rounded-xl border px-8 py-4 text-left text-[26px] tracking-wide transition-colors',
        danger
          ? 'border-red-300/10 text-red-200/80 hover:border-red-300/40 hover:bg-red-950/30'
          : 'border-white/[0.07] text-white/85 hover:border-[#e8c88f]/50 hover:bg-white/[0.04]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
