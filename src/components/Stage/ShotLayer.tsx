import { AnimatePresence, motion } from 'framer-motion';
import { content } from '@/data';
import { shotSrc, shotVideo } from '@/lib/assetResolver';
import { useSettings } from '@/store/settingsStore';
import type { CameraFraming, ShotDefinition } from '@/types';
import { SLOT_X, SPRITE_H, SPRITE_W } from '../CharacterRenderer/CharacterRenderer';
import { MediaWithFallback } from './MediaWithFallback';
import { PlaceholderBackground } from './placeholders/PlaceholderBackground';
import { PlaceholderCharacter } from './placeholders/PlaceholderCharacter';

/** Full-frame shot (the primary presentation for rendered scenes). */
export function ShotLayer({ id }: { id: string | null }) {
  return (
    <AnimatePresence>
      {id && (
        <motion.div
          key={id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
        >
          <CameraDrift id={id}>
            <ShotImage id={id} />
          </CameraDrift>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * A slow, barely-noticeable camera move on still shots, chosen from the
 * framing: wide shots pan, closer shots push in. Clips already move, so they
 * are left alone.
 */
function CameraDrift({ id, children }: { id: string; children: React.ReactNode }) {
  const animations = useSettings((s) => s.animations);
  const def = content.shots[id];
  if (!animations || !def || shotVideo(id)) return <div className="absolute inset-0">{children}</div>;
  const dir = id.length % 2 === 0 ? 1 : -1;
  // Pixels on the 1920×1080 design canvas (percentages are not animated reliably).
  const move =
    def.camera === 'wide'
      ? { scale: [1.06, 1.06], x: [-28 * dir, 28 * dir] }
      : def.camera === 'medium' || def.camera === 'over_shoulder'
        ? { scale: [1.01, 1.05], x: [0, 12 * dir] }
        : { scale: [1.0, 1.035], y: [0, -7] };
  return (
    <motion.div
      className="absolute inset-0"
      data-drift={def.camera}
      animate={move}
      transition={{ duration: 24, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
    >
      {children}
    </motion.div>
  );
}

export function ShotImage({ id, showBrief = true, still = false }: { id: string; showBrief?: boolean; still?: boolean }) {
  const def = content.shots[id];
  if (!def) return null;
  return (
    <MediaWithFallback
      video={shotVideo(id)}
      stillOnly={still}
      src={shotSrc(id)}
      alt={def.description}
      className="absolute inset-0 h-full w-full object-cover"
      fallback={<ShotPlaceholder def={def} showBrief={showBrief} />}
    />
  );
}

/**
 * Framing per camera: sprite scale, and where the head (art y≈212) lands on
 * the 1080 frame. Mirrors real lens choices so the placeholder previews the
 * composition the final render should have.
 */
const FRAMING: Record<CameraFraming, { scale: number; headY: number; bgBlur: number; bgScale: number }> = {
  wide: { scale: 0.55, headY: 470, bgBlur: 0, bgScale: 1 },
  medium: { scale: 0.95, headY: 300, bgBlur: 1.5, bgScale: 1.08 },
  over_shoulder: { scale: 1.05, headY: 290, bgBlur: 2, bgScale: 1.1 },
  close: { scale: 1.75, headY: 360, bgBlur: 5, bgScale: 1.22 },
  extreme_close: { scale: 2.7, headY: 470, bgBlur: 8, bgScale: 1.35 },
};

function ShotPlaceholder({ def, showBrief }: { def: ShotDefinition; showBrief: boolean }) {
  const bg = content.backgrounds[def.background];
  const f = FRAMING[def.camera];
  return (
    <div className="absolute inset-0 overflow-hidden">
      {bg && (
        <div className="absolute inset-0" style={{ transform: `scale(${f.bgScale})`, filter: f.bgBlur ? `blur(${f.bgBlur}px)` : undefined }}>
          <PlaceholderBackground id={bg.id} art={bg.placeholder} />
        </div>
      )}
      {def.characters.map((c) => {
        const cdef = content.characters[c.id];
        const art = content.characterArt[c.id];
        if (!cdef || !art) return null;
        const scale = f.scale * art.silhouette.height;
        const w = SPRITE_W * scale;
        const h = SPRITE_H * scale;
        const x = (1920 * SLOT_X[c.position ?? 'center']) / 100 - w / 2;
        const top = f.headY - 212 * scale;
        return (
          <div
            key={c.id}
            className="absolute"
            style={{ left: x, top, width: w, height: h, transform: c.facing === 'left' ? 'scaleX(-1)' : undefined }}
          >
            <PlaceholderCharacter
              spec={art.silhouette}
              pose={c.pose ?? cdef.defaultPose}
              expression={c.expression ?? 'neutral'}
              color={cdef.color}
            />
          </div>
        );
      })}
      {def.camera === 'over_shoulder' && (
        <div className="absolute -bottom-40 -left-40 h-[900px] w-[700px] rounded-full bg-black/85 blur-2xl" />
      )}
      {/* Cinematic grade: letterbox-style vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
      {import.meta.env.DEV && showBrief && (
        <div className="absolute left-1/2 top-6 max-w-[640px] -translate-x-1/2 rounded-md bg-black/55 px-4 py-2 text-center text-[13px] leading-snug text-white/55">
          <div className="font-mono text-white/75">
            PLACEHOLDER · {def.id} · {def.camera}
          </div>
          <div>{def.description}</div>
        </div>
      )}
    </div>
  );
}
