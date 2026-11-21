import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useUi, type Toast } from '@/store/uiStore';

const TOAST_MS = 3200;

export function Toasts() {
  const toasts = useUi((s) => s.toasts);
  return (
    <div className="pointer-events-none absolute right-[44px] top-[96px] z-[70] flex flex-col items-end gap-3">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useUi((s) => s.dismissToast);
  useEffect(() => {
    const id = setTimeout(() => dismiss(t.id), TOAST_MS);
    return () => clearTimeout(id);
  }, [t.id, dismiss]);
  const icon = t.tone === 'achievement' ? '★' : t.tone === 'milestone' ? '✦' : t.tone === 'info' ? '•' : t.tone === 'up' ? '▲' : '▼';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-black/60 px-6 py-3 text-[19px] text-white/85 backdrop-blur-md"
    >
      <span style={{ color: t.tone === 'achievement' ? '#e8c88f' : t.color }} className={t.tone === 'down' ? 'opacity-60' : ''}>
        {icon}
      </span>
      {t.tone === 'achievement' && <span className="text-[14px] uppercase tracking-[0.25em] text-[#e8c88f]/80">Achievement</span>}
      <span className={t.tone === 'milestone' || t.tone === 'achievement' ? 'font-serif text-[22px] italic' : ''}>{t.text}</span>
    </motion.div>
  );
}
