import { motion } from 'framer-motion';

export function TitleCard({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="text-[22px] uppercase text-white/50"
        initial={{ letterSpacing: '0.3em', opacity: 0 }}
        animate={{ letterSpacing: '0.6em', opacity: 1 }}
        transition={{ duration: 2.4, ease: 'easeOut' }}
      >
        {title}
      </motion.div>
      <motion.div className="my-7 h-px bg-[#e8c88f]/60" initial={{ width: 0 }} animate={{ width: 220 }} transition={{ delay: 0.4, duration: 1.4 }} />
      {subtitle && (
        <motion.div
          className="font-serif text-[96px] italic leading-none text-[#f1ece2]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {subtitle}
        </motion.div>
      )}
    </motion.div>
  );
}
