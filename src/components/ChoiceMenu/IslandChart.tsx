import { useMemo } from 'react';

/**
 * The island drawn as an old nautical chart, used until a map illustration is
 * added (`src/assets/shots/map_island.webp`). Coordinates are in a 1600×900
 * frame; the places in `src/data/maps.ts` are percentages of the same frame.
 */

type Pt = [number, number];

// Clockwise from the northern tip.
const COAST: Pt[] = [
  [690, 118], [800, 140], [905, 178], [1010, 222], [1105, 276], [1168, 340], [1188, 405],
  [1236, 462], [1212, 522], [1252, 578], [1186, 618], [1080, 640], [960, 652], [870, 668],
  [790, 690], [712, 684], [640, 694], [560, 668], [470, 640], [386, 592], [318, 520],
  [286, 440], [296, 356], [338, 282], [410, 222], [492, 178], [588, 140],
];

// Inland loop of the coast road (through the harbour, past the hotel, round the north).
const ROAD: Pt[] = [
  [712, 640], [820, 628], [940, 610], [1050, 590], [1120, 520], [1110, 430], [1060, 360],
  [980, 290], [880, 236], [770, 200], [672, 196], [560, 218], [460, 270], [392, 350],
  [372, 440], [410, 522], [490, 590], [600, 628],
];

/** Closed Catmull-Rom spline through the points, as an SVG path. */
function smooth(points: Pt[], closed = true): string {
  const n = points.length;
  const at = (i: number) => points[((i % n) + n) % n]!;
  let d = `M${at(0)[0]},${at(0)[1]}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return closed ? d + 'Z' : d;
}

/** The same shape pulled toward a centre: contour lines. */
function shrink(points: Pt[], k: number, centre: Pt): Pt[] {
  return points.map(([x, y]) => [centre[0] + (x - centre[0]) * k, centre[1] + (y - centre[1]) * k]);
}

const INK = '#4a3b28';
const PAPER = '#e8dcc0';
const SEA = '#b9c6c2';

export function IslandChart({ title }: { title: string }) {
  const paths = useMemo(() => {
    const centre: Pt = [800, 410];
    return {
      coast: smooth(COAST),
      contours: [0.82, 0.64, 0.46, 0.3].map((k) => smooth(shrink(COAST, k, [centre[0] + 40 * (1 - k), centre[1]]))),
      road: smooth(ROAD),
    };
  }, []);

  return (
    <svg viewBox="0 0 1600 900" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="ic-sea" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#c9d4cf" />
          <stop offset="100%" stopColor="#8fa29f" />
        </radialGradient>
        <radialGradient id="ic-vignette" cx="50%" cy="50%" r="72%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a1d0e" stopOpacity="0.55" />
        </radialGradient>
        <pattern id="ic-grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M100 0H0V100" fill="none" stroke={INK} strokeOpacity="0.1" strokeWidth="1" />
        </pattern>
        <filter id="ic-paper">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.22  0 0 0 0 0.12  0 0 0 0.09 0" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>

      {/* Sea, grid and coastal shading (concentric strokes fading out from the shore). */}
      <rect width="1600" height="900" fill="url(#ic-sea)" />
      <rect width="1600" height="900" fill="url(#ic-grid)" />
      {[70, 46, 26].map((w, i) => (
        <path key={w} d={paths.coast} fill="none" stroke={SEA} strokeOpacity={0.35 + i * 0.2} strokeWidth={w} />
      ))}
      {[34, 58].map((w) => (
        <path key={w} d={paths.coast} fill="none" stroke={INK} strokeOpacity="0.16" strokeWidth={w} strokeDasharray="2 10" />
      ))}

      {/* Land. */}
      <path d={paths.coast} fill={PAPER} />
      {paths.contours.map((d, i) => (
        <path key={i} d={d} fill={INK} fillOpacity={0.035 + i * 0.012} stroke={INK} strokeOpacity="0.22" strokeWidth="1.2" />
      ))}
      <path d={paths.coast} fill="none" stroke={INK} strokeWidth="2.6" />

      {/* East cliffs: hatching along the shore below the hotel. */}
      {Array.from({ length: 14 }, (_, i) => {
        const t = i / 13;
        const x = 1120 + t * 70;
        const y = 300 + t * 130;
        return <path key={i} d={`M${x},${y} l18,6`} stroke={INK} strokeWidth="2" strokeOpacity="0.55" />;
      })}

      {/* Coast road. */}
      <path d={paths.road} fill="none" stroke={PAPER} strokeWidth="9" />
      <path d={paths.road} fill="none" stroke={INK} strokeOpacity="0.6" strokeWidth="2.4" strokeDasharray="10 7" />

      {/* Harbour: breakwater and ferry pier. */}
      <path d="M676,690 q-26,58 18,96" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M730,686 v74" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M716,770 h28" stroke={INK} strokeWidth="3" />
      {/* Town: a few blocks above the harbour. */}
      {[[680, 630], [700, 612], [724, 634], [748, 616], [770, 638], [652, 612], [800, 612]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="15" height="11" fill={INK} fillOpacity="0.7" transform={`rotate(-8 ${x} ${y})`} />
      ))}
      {/* Hotel. */}
      <rect x="1056" y="330" width="34" height="20" fill={INK} fillOpacity="0.8" />
      <path d="M1052,330 l21,-14 l21,14z" fill={INK} fillOpacity="0.8" />
      {/* Factory at the north end. */}
      <rect x="652" y="146" width="40" height="16" fill={INK} fillOpacity="0.55" />
      <path d="M686,146 v-14" stroke={INK} strokeWidth="5" />

      {/* Ferry route out to the mainland. */}
      <path d="M730,780 C760,840 900,880 1080,900" fill="none" stroke={INK} strokeOpacity="0.45" strokeWidth="2" strokeDasharray="4 9" />
      <text x="1010" y="866" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="22" fill={INK} fillOpacity="0.6">
        ferry to the mainland
      </text>

      {/* Sea depth soundings. */}
      {[[180, 160, 41], [1380, 210, 58], [1440, 690, 63], [220, 760, 37], [1000, 790, 22], [480, 110, 29], [1330, 470, 12]].map(([x, y, n]) => (
        <text key={`${x}-${y}`} x={x} y={y} fontFamily="var(--font-serif)" fontSize="20" fill={INK} fillOpacity="0.5">
          {n}
        </text>
      ))}

      {/* Compass rose. */}
      <g transform="translate(1440,130)" stroke={INK} fill={INK}>
        <circle r="62" fill="none" strokeOpacity="0.5" strokeWidth="1.5" />
        <circle r="48" fill="none" strokeOpacity="0.35" strokeWidth="1" />
        <path d="M0,-70 L10,0 L0,70 L-10,0Z" fillOpacity="0.75" stroke="none" />
        <path d="M-70,0 L0,10 L70,0 L0,-10Z" fillOpacity="0.4" stroke="none" />
        <text y="-80" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="26" fontWeight="600" stroke="none">
          N
        </text>
      </g>

      {/* Title cartouche. */}
      <g transform="translate(96,770)">
        <rect x="-18" y="-58" width="380" height="96" fill={PAPER} fillOpacity="0.85" stroke={INK} strokeWidth="1.5" />
        <text fontFamily="var(--font-serif)" fontStyle="italic" fontSize="46" fill={INK}>
          {title}
        </text>
        <text y="28" fontFamily="var(--font-serif)" fontSize="18" letterSpacing="5" fill={INK} fillOpacity="0.7">
          SOUNDINGS IN FATHOMS
        </text>
      </g>

      <rect width="1600" height="900" filter="url(#ic-paper)" fill="#fff" />
      <rect width="1600" height="900" fill="url(#ic-vignette)" />
    </svg>
  );
}
