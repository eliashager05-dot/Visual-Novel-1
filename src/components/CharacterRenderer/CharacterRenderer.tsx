import { AnimatePresence, motion } from 'framer-motion';
import { content } from '@/data';
import { spriteSrc } from '@/lib/assetResolver';
import type { StageCharacter, StagePosition } from '@/types';
import { ImageWithFallback } from '../Stage/ImageWithFallback';
import { PlaceholderCharacter } from '../Stage/placeholders/PlaceholderCharacter';

/** Horizontal centre of each stage slot, as % of stage width. */
export const SLOT_X: Record<StagePosition, number> = {
  farLeft: 14,
  left: 30,
  center: 50,
  right: 70,
  farRight: 86,
};

/** Sprite art box is 600×1500; scaled so an average-height character's head sits in the upper third. */
export const SPRITE_W = 600;
export const SPRITE_H = 1500;
const BASE_SCALE = 0.86;

export function CharacterLayer({ characters, speaker }: { characters: StageCharacter[]; speaker: string | null }) {
  const someoneSpeaking = speaker !== null && characters.some((c) => c.id === speaker);
  return (
    <div className="pointer-events-none absolute inset-0">
      <AnimatePresence>
        {characters.map((c) => (
          <Sprite key={c.id} c={c} dimmed={someoneSpeaking && c.id !== speaker} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Sprite({ c, dimmed }: { c: StageCharacter; dimmed: boolean }) {
  const def = content.characters[c.id];
  const art = content.characterArt[c.id];
  if (!def || !art) return null;
  const scale = BASE_SCALE * art.silhouette.height;
  const w = SPRITE_W * scale;
  const h = SPRITE_H * scale;
  // Feet extend below the frame: framed from head to roughly mid-thigh.
  const top = 1080 - h * 0.74;
  const left = (1920 * SLOT_X[c.position]) / 100 - w / 2;

  return (
    <motion.div
      className="absolute"
      style={{ width: w, height: h, top }}
      initial={{ opacity: 0, left, y: 24 }}
      animate={{
        opacity: 1,
        left,
        y: 0,
        filter: dimmed ? 'brightness(0.62) saturate(0.85)' : 'brightness(1) saturate(1)',
      }}
      exit={{ opacity: 0, y: 16, transition: { duration: 0.35 } }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Idle "breathing": a tiny vertical scale anchored at the feet. */}
      <motion.div
        className="h-full w-full origin-bottom"
        animate={{ scaleY: [1, 1.006, 1] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ImageWithFallback
          src={spriteSrc(c.id, c.pose, c.expression)}
          alt={`${def.name} (${c.expression})`}
          className="h-full w-full object-contain object-bottom"
          fallback={<PlaceholderCharacter spec={art.silhouette} pose={c.pose} expression={c.expression} color={def.color} />}
        />
      </motion.div>
    </motion.div>
  );
}
