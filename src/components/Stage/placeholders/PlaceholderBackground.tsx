import { memo } from 'react';
import type { PlaceholderArt } from '@/types';
import { seeded } from '@/lib/random';

/**
 * Procedural stand-in for a background render. Deterministic per id, so the
 * same location always looks the same. Drawn at the 1920×1080 design size.
 */
export const PlaceholderBackground = memo(function PlaceholderBackground({
  id,
  art,
}: {
  id: string;
  art: PlaceholderArt;
}) {
  const [top, mid, bottom] = art.palette;
  const rnd = seeded(id);
  const g = `bg-${id}`;
  const motif = art.motif ?? 'exterior';

  const stars =
    motif === 'night'
      ? Array.from({ length: 140 }, (_, i) => (
          <circle key={i} cx={rnd() * 1920} cy={rnd() * 520} r={rnd() * 1.6 + 0.3} fill="#fff" opacity={rnd() * 0.7 + 0.1} />
        ))
      : null;

  const lights = (count: number, x0: number, x1: number, y0: number, y1: number, color = '#ffcf87') =>
    Array.from({ length: count }, (_, i) => {
      const x = x0 + rnd() * (x1 - x0);
      const y = y0 + rnd() * (y1 - y0);
      return <rect key={i} x={x} y={y} width={6 + rnd() * 8} height={8 + rnd() * 8} fill={color} opacity={0.5 + rnd() * 0.5} />;
    });

  return (
    <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id={`${g}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.62" stopColor={mid} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${g}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={mid} stopOpacity="0.9" />
          <stop offset="1" stopColor={mid} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${g}-warm`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd59a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd59a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${g}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mid} stopOpacity="0.55" />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>

      <rect width="1920" height="1080" fill={`url(#${g}-sky)`} />
      {stars}

      {(motif === 'water' || motif === 'exterior') && (
        <>
          <circle cx={1300} cy={560} r={360} fill={`url(#${g}-glow)`} />
          <path
            d={`M0 620 Q ${300 + rnd() * 200} ${560 - rnd() * 40} 700 600 T 1250 590 T 1920 610 V 1080 H0Z`}
            fill={bottom}
            opacity="0.55"
          />
          <path d="M1080 600 q 160 -120 340 -40 q 80 30 160 40 Z" fill={bottom} opacity="0.9" />
          {lights(18, 1130, 1500, 545, 595)}
          <rect x="1490" y="470" width="14" height="130" fill={bottom} />
          <polygon points="1497,470 1900,420 1900,520" fill="#fff6d8" opacity="0.06" />
          <rect y="640" width="1920" height="440" fill={`url(#${g}-water)`} />
          {Array.from({ length: 40 }, (_, i) => (
            <rect
              key={i}
              x={rnd() * 1920}
              y={650 + rnd() * 420}
              width={40 + rnd() * 220}
              height="2"
              fill={mid}
              opacity={0.15 + rnd() * 0.3}
            />
          ))}
          {motif === 'water' ? (
            <g opacity="0.85">
              <rect y="880" width="1920" height="14" fill="#0c1118" />
              {Array.from({ length: 13 }, (_, i) => (
                <rect key={i} x={i * 160 + 30} y="880" width="10" height="200" fill="#0c1118" />
              ))}
              <rect y="960" width="1920" height="6" fill="#0c1118" />
            </g>
          ) : (
            <g opacity="0.92">
              <rect y="900" width="1920" height="180" fill="#14110f" />
              {Array.from({ length: 7 }, (_, i) => (
                <rect key={i} x={120 + i * 280} y="760" width="14" height="140" fill="#14110f" />
              ))}
              <path d="M0 900 L 1920 870 V 905 L0 935 Z" fill="#221c18" />
            </g>
          )}
        </>
      )}

      {motif === 'night' && (
        <>
          <path d="M0 760 Q 480 640 960 700 T 1920 690 V1080 H0Z" fill={bottom} />
          <rect x="560" y="360" width="800" height="400" fill="#0a0e17" />
          <polygon points="540,360 960,250 1380,360" fill="#0a0e17" />
          <rect x="900" y="200" width="40" height="90" fill="#0a0e17" />
          {Array.from({ length: 5 }, (_, row) =>
            Array.from({ length: 12 }, (_, col) => {
              const lit = rnd() > 0.55;
              return (
                <rect
                  key={`${row}-${col}`}
                  x={600 + col * 62}
                  y={390 + row * 70}
                  width="28"
                  height="40"
                  fill={lit ? '#ffcf87' : '#1a2233'}
                  opacity={lit ? 0.75 : 1}
                />
              );
            }),
          )}
          <rect x="900" y="660" width="120" height="100" fill="#ffcf87" opacity="0.55" />
          <circle cx="960" cy="720" r="260" fill={`url(#${g}-warm)`} />
          <path d="M0 860 Q 600 820 960 840 T 1920 830 V1080 H0Z" fill="#06080d" />
        </>
      )}

      {(motif === 'interior' || motif === 'room') && (
        <>
          <rect width="1920" height="700" fill={mid} opacity="0.35" />
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={i * 220 + 20} y="80" width="180" height="520" fill="none" stroke={bottom} strokeOpacity="0.35" strokeWidth="3" />
          ))}
          <rect x="760" y="140" width="400" height="420" fill={top} opacity="0.9" />
          <rect x="760" y="140" width="400" height="420" fill="none" stroke={bottom} strokeWidth="12" />
          <line x1="960" y1="140" x2="960" y2="560" stroke={bottom} strokeWidth="8" />
          <rect y="700" width="1920" height="380" fill={bottom} />
          <rect y="690" width="1920" height="16" fill={top} opacity="0.6" />
          {[260, 1660].map((x) => (
            <g key={x}>
              <circle cx={x} cy="360" r="260" fill={`url(#${g}-warm)`} />
              <rect x={x - 6} y="330" width="12" height="60" fill="#2a1d14" />
              <ellipse cx={x} cy="330" rx="38" ry="22" fill="#ffdca8" opacity="0.85" />
            </g>
          ))}
          {motif === 'interior' && <rect x="1180" y="640" width="560" height="120" rx="8" fill="#1c120c" opacity="0.9" />}
          {motif === 'room' && <rect x="120" y="600" width="620" height="220" rx="16" fill="#e8dccb" opacity="0.25" />}
        </>
      )}

      {motif === 'bar' && (
        <>
          {Array.from({ length: 34 }, (_, i) => (
            <circle
              key={i}
              cx={rnd() * 1920}
              cy={rnd() * 700}
              r={20 + rnd() * 60}
              fill={rnd() > 0.5 ? '#ffb86b' : mid}
              opacity={0.08 + rnd() * 0.18}
            />
          ))}
          {[230, 360, 490].map((y) => (
            <g key={y}>
              <rect x="300" y={y} width="1320" height="8" fill="#2a1a20" />
              {Array.from({ length: 26 }, (_, i) => {
                const h = 40 + rnd() * 50;
                return (
                  <rect key={i} x={320 + i * 50 + rnd() * 10} y={y - h} width="18" height={h} rx="5" fill={mid} opacity={0.35 + rnd() * 0.4} />
                );
              })}
            </g>
          ))}
          <rect y="700" width="1920" height="60" fill="#3a2028" />
          <rect y="760" width="1920" height="320" fill="#120a0e" />
          <rect y="700" width="1920" height="4" fill="#ffb86b" opacity="0.4" />
        </>
      )}

      {(motif === 'shore' || motif === 'storm') && (
        <>
          <circle cx={1400} cy={520} r={300} fill={`url(#${g}-glow)`} opacity={motif === 'storm' ? 0.3 : 1} />
          <rect y="560" width="1920" height="300" fill={`url(#${g}-water)`} />
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={rnd() * 1920} y={570 + rnd() * 260} width={60 + rnd() * 200} height="2" fill={mid} opacity={0.15 + rnd() * 0.3} />
          ))}
          <path d="M0 760 Q 400 700 900 760 T 1920 740 V1080 H0Z" fill={bottom} />
          <path d="M0 860 Q 600 820 1100 880 T 1920 860 V1080 H0Z" fill="#000" opacity="0.35" />
          {[120, 1500, 1720].map((x, i) => (
            <ellipse key={i} cx={x} cy={800 + i * 30} rx={160 + i * 30} ry={70} fill="#0b0d10" opacity="0.85" />
          ))}
          {motif === 'storm' &&
            Array.from({ length: 220 }, (_, i) => {
              const x = rnd() * 2100 - 100;
              const y = rnd() * 1080;
              return <line key={`r${i}`} x1={x} y1={y} x2={x - 18} y2={y + 60} stroke="#cfd8e6" strokeOpacity={0.12 + rnd() * 0.2} strokeWidth="1.5" />;
            })}
        </>
      )}

      {/* Cinematic grade: vignette + subtle top/bottom darkening. */}
      <radialGradient id={`${g}-vig`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.65" />
      </radialGradient>
      <rect width="1920" height="1080" fill={`url(#${g}-vig)`} />
    </svg>
  );
});
