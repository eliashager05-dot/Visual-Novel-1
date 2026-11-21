import { motion } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { seeded } from '@/lib/random';
import { useSettings } from '@/store/settingsStore';
import type { StageFx } from '@/types';

/**
 * Weather and light over the image ("living stills"). Purely visual, drawn at
 * the 1920×1080 design size, and off when Settings → Animated scenes is off.
 */
export function EffectsLayer({ fx }: { fx: StageFx | null }) {
  const animations = useSettings((s) => s.animations);
  if (!fx || !animations) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {fx.flicker && <Flicker kind={fx.flicker} />}
      {fx.fog && <Fog level={fx.fog} />}
      {fx.dust && <Motes kind="dust" />}
      {fx.sparkle && <Motes kind="sparkle" />}
      {fx.rain && <Rain intensity={fx.rain} />}
      {fx.lightning && <Lightning />}
    </div>
  );
}

// --- Rain: a canvas of falling streaks --------------------------------------
const RAIN = {
  light: { drops: 160, speed: 1300, len: 26, alpha: 0.22, wind: 0.12, width: 1.2 },
  heavy: { drops: 420, speed: 2100, len: 44, alpha: 0.3, wind: 0.22, width: 1.5 },
  // Seen through glass: fewer, slower, softer.
  window: { drops: 120, speed: 900, len: 18, alpha: 0.12, wind: 0.05, width: 1 },
} as const;

const Rain = memo(function Rain({ intensity }: { intensity: keyof typeof RAIN }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const cfg = RAIN[intensity];
    const W = canvas.width;
    const H = canvas.height;
    const drops = Array.from({ length: cfg.drops }, () => ({
      x: Math.random() * W * 1.2 - W * 0.1,
      y: Math.random() * H,
      v: cfg.speed * (0.7 + Math.random() * 0.6),
      l: cfg.len * (0.6 + Math.random() * 0.8),
    }));
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = `rgba(210, 222, 240, ${cfg.alpha})`;
      ctx.lineWidth = cfg.width;
      ctx.beginPath();
      for (const d of drops) {
        d.y += d.v * dt;
        d.x += d.v * cfg.wind * dt;
        if (d.y - d.l > H) {
          d.y = -d.l - Math.random() * 200;
          d.x = Math.random() * W * 1.2 - W * 0.1;
        }
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * cfg.wind, d.y - d.l);
      }
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [intensity]);
  return (
    <canvas
      ref={ref}
      width={1920}
      height={1080}
      className="absolute inset-0 h-full w-full"
      style={intensity === 'window' ? { filter: 'blur(1px)' } : undefined}
      data-fx="rain"
    />
  );
});

// --- Lightning: irregular double flashes ------------------------------------
function Lightning() {
  const [flash, setFlash] = useState(0);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const next = () => {
      t = setTimeout(() => {
        setFlash((f) => f + 1);
        next();
      }, 5000 + Math.random() * 9000);
    };
    next();
    return () => clearTimeout(t);
  }, []);
  if (!flash) return null;
  return (
    <motion.div
      key={flash}
      className="absolute inset-0 bg-[#dfe8ff]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.55, 0.05, 0.35, 0] }}
      transition={{ duration: 0.7, times: [0, 0.08, 0.25, 0.35, 1] }}
      data-fx="lightning"
    />
  );
}

// --- Fog: slow drifting banks -----------------------------------------------
function Fog({ level }: { level: 'light' | 'heavy' }) {
  const o = level === 'heavy' ? 0.42 : 0.22;
  return (
    <div className="absolute inset-0" data-fx="fog">
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          className="absolute -inset-y-[10%] w-[160%]"
          style={{
            left: i ? '-60%' : '-10%',
            opacity: o,
            background:
              'radial-gradient(ellipse 30% 35% at 25% 70%, rgba(220,226,235,0.9), transparent 70%), radial-gradient(ellipse 35% 30% at 70% 60%, rgba(220,226,235,0.8), transparent 70%)',
            filter: 'blur(30px)',
          }}
          animate={{ x: i ? ['0%', '12%'] : ['0%', '-10%'] }}
          transition={{ duration: 40 + i * 15, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// --- Flicker: a light source that will not hold still -----------------------
function Flicker({ kind }: { kind: 'candle' | 'lamp' }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let level = 0;
    let target = 0;
    let nextChange = 0;
    const strength = kind === 'candle' ? 0.16 : 0.07;
    const frame = (now: number) => {
      if (now > nextChange) {
        target = Math.random() * strength;
        nextChange = now + 60 + Math.random() * (kind === 'candle' ? 160 : 600);
      }
      level += (target - level) * 0.18;
      if (ref.current) ref.current.style.opacity = String(level);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [kind]);
  return (
    <>
      {/* Warm cast, constant */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(255,170,80,0.10), transparent 70%)' }} />
      {/* Brightness wobble: a dark veil whose opacity flickers */}
      <div ref={ref} className="absolute inset-0 bg-black" style={{ opacity: 0 }} data-fx="flicker" />
    </>
  );
}

// --- Motes: dust in the light, or glowing points in water --------------------
const Motes = memo(function Motes({ kind }: { kind: 'dust' | 'sparkle' }) {
  const rnd = seeded(kind);
  const count = kind === 'dust' ? 26 : 46;
  return (
    <div className="absolute inset-0" data-fx={kind}>
      {Array.from({ length: count }, (_, i) => {
        const x = rnd() * 100;
        const y = kind === 'sparkle' ? 55 + rnd() * 45 : rnd() * 100;
        const size = kind === 'sparkle' ? 3 + rnd() * 4 : 2 + rnd() * 3;
        const dur = (kind === 'sparkle' ? 2 : 9) + rnd() * (kind === 'sparkle' ? 3 : 8);
        const color = kind === 'sparkle' ? '#5ff5e0' : '#ffe6bf';
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, background: color, boxShadow: `0 0 ${size * 3}px ${color}` }}
            animate={
              kind === 'sparkle'
                ? { opacity: [0, 0.9, 0], scale: [0.6, 1.2, 0.6] }
                : { opacity: [0, 0.55, 0], y: [0, -60 - rnd() * 60], x: [0, (rnd() - 0.5) * 80] }
            }
            transition={{ duration: dur, repeat: Infinity, delay: rnd() * dur, ease: 'easeInOut' }}
          />
        );
      })}
    </div>
  );
});
