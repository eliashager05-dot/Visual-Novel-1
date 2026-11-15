import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { content } from '@/data';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useGameStore } from '@/store/gameStore';
import { useSaves } from '@/store/saveStore';
import { useUi } from '@/store/uiStore';
import { GalleryScreen } from '../Gallery/GalleryScreen';
import { SaveLoadScreen } from '../SaveMenu/SaveLoadScreen';
import { SettingsScreen } from '../SettingsMenu/SettingsScreen';
import { BackgroundImage } from '../Stage/BackgroundLayer';

const MENU_BG = 'hotel_exterior_night';

export function MainMenu() {
  const [naming, setNaming] = useState(false);
  const fs = useFullscreen();
  const latest = useSaves((s) => s.latest);
  const load = useGameStore((s) => s.load);
  const startReplay = useGameStore((s) => s.startReplay);
  const screen = useUi((s) => s.menuScreen);
  const setScreen = useUi((s) => s.setMenuScreen);
  const close = () => setScreen('none');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (useUi.getState().menuScreen !== 'none') useUi.getState().setMenuScreen('none');
      else setNaming(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
      <motion.div
        className="absolute -inset-[3%]"
        animate={{ scale: [1.02, 1.08], x: [0, -30] }}
        transition={{ duration: 60, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
      >
        <BackgroundImage id={MENU_BG} />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
      <Drift />

      <div className="absolute left-[150px] top-[230px]">
        <motion.h1
          className="font-serif text-[150px] font-light leading-none text-[#f1ece2]"
          initial={{ opacity: 0, letterSpacing: '0.05em' }}
          animate={{ opacity: 1, letterSpacing: '0.18em' }}
          transition={{ duration: 2.2, ease: 'easeOut' }}
        >
          HALCYON
        </motion.h1>
        <motion.p
          className="mt-6 font-serif text-[34px] italic text-white/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1.4 }}
        >
          Every tide comes back for something.
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {naming ? (
          <NameEntry key="name" onBack={() => setNaming(false)} />
        ) : (
          <motion.nav
            key="menu"
            className="absolute left-[150px] top-[540px] flex flex-col items-start gap-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {latest && (
              <MenuItem onClick={() => load(latest.slot)} sub={`${latest.chapterTitle} · ${latest.sceneTitle}`}>
                Continue
              </MenuItem>
            )}
            <MenuItem onClick={() => setNaming(true)}>New Game</MenuItem>
            <MenuItem onClick={() => setScreen('load')}>Load</MenuItem>
            <MenuItem onClick={() => setScreen('gallery')}>Gallery</MenuItem>
            <MenuItem onClick={() => setScreen('settings')}>Settings</MenuItem>
            {fs.supported && <MenuItem onClick={fs.toggle}>{fs.isFullscreen ? 'Windowed' : 'Fullscreen'}</MenuItem>}
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="absolute bottom-[40px] left-[150px] text-[15px] tracking-[0.2em] text-white/30">
        ALL CHARACTERS ARE 21 OR OLDER · CONTAINS MATURE THEMES · v0.3
      </div>

      <AnimatePresence>
        {screen === 'load' && <SaveLoadScreen key="load" mode="load" onClose={close} onLoaded={close} />}
        {screen === 'settings' && <SettingsScreen key="settings" onClose={close} />}
        {screen === 'gallery' && (
          <GalleryScreen
            key="gallery"
            onClose={close}
            onReplay={(id) => {
              close();
              useUi.getState().reset();
              startReplay(id);
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MenuItem({ children, onClick, sub }: { children: string; onClick: () => void; sub?: string }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-5 py-1.5 text-left text-[36px] font-light tracking-[0.12em] text-white/70 transition-colors hover:text-white">
      <span className="h-px w-0 bg-[#e8c88f] transition-all duration-300 group-hover:w-12" />
      <span>
        {children}
        {sub && <span className="block text-[15px] tracking-[0.15em] text-white/35">{sub}</span>}
      </span>
    </button>
  );
}

function NameEntry({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState(content.defaultPlayerName);
  const newGame = useGameStore((s) => s.newGame);
  return (
    <motion.form
      className="absolute left-[150px] top-[560px] w-[620px]"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      onSubmit={(e) => {
        e.preventDefault();
        useUi.getState().reset();
        newGame(name);
      }}
    >
      <label className="block text-[18px] uppercase tracking-[0.3em] text-white/45" htmlFor="player-name">
        What should they call you?
      </label>
      <input
        id="player-name"
        autoFocus
        maxLength={16}
        value={name}
        onChange={(e) => setName(e.target.value.replace(/[{}]/g, ''))}
        className="mt-4 w-full border-b border-white/25 bg-transparent pb-3 font-serif text-[56px] text-[#f1ece2] outline-none focus:border-[#e8c88f]"
      />
      <div className="mt-10 flex gap-8">
        <button type="submit" className="rounded-full bg-[#f1ece2] px-12 py-4 text-[20px] uppercase tracking-[0.3em] text-black hover:bg-white">
          Begin
        </button>
        <button type="button" onClick={onBack} className="text-[20px] uppercase tracking-[0.3em] text-white/45 hover:text-white">
          Back
        </button>
      </div>
    </motion.form>
  );
}

/** Slow floating motes for atmosphere. Deterministic positions. */
function Drift() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 18 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute h-[6px] w-[6px] rounded-full bg-[#ffd9a0]"
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`, filter: 'blur(1px)' }}
          animate={{ y: [0, -40, 0], opacity: [0.05, 0.5, 0.05] }}
          transition={{ duration: 8 + (i % 5) * 2, repeat: Infinity, delay: i * 0.6, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
