import { memo } from 'react';
import type { Expression, SilhouetteSpec } from '@/types';

/**
 * Procedural stand-in sprite. It is stylised on purpose: it should read as
 * "this is Vera, worried, arms crossed" without pretending to be final art.
 * Every parameter comes from the locked SilhouetteSpec, so a character looks
 * identical in every scene. Drawn in a 600×1500 box; feet are below the frame.
 */

const INK = '#22181a';

/** Colour helpers — sprites must be fully opaque, so shading is done by mixing, not alpha. */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(r1, r2)}, ${c(g1, g2)}, ${c(b1, b2)})`;
}
const shade = (hex: string, amount: number) => mix(hex, amount < 0 ? '#000000' : '#ffffff', Math.abs(amount));

interface Face {
  browL: string;
  browR: string;
  eyes: 'open' | 'wide' | 'closed' | 'lidded' | 'wink';
  mouth: string;
  mouthFill?: boolean;
  blush?: boolean;
}

const FACES: Record<Expression, Face> = {
  neutral: { browL: 'M252 182 L288 181', browR: 'M312 181 L348 182', eyes: 'open', mouth: 'M284 263 L316 263' },
  happy: { browL: 'M252 181 Q270 171 288 177', browR: 'M312 177 Q330 171 348 181', eyes: 'open', mouth: 'M278 257 Q300 277 322 257' },
  sad: { browL: 'M252 185 L288 172', browR: 'M312 172 L348 185', eyes: 'lidded', mouth: 'M284 270 Q300 258 316 270' },
  angry: { browL: 'M252 172 L290 187', browR: 'M310 187 L348 172', eyes: 'lidded', mouth: 'M284 266 Q300 261 316 266' },
  surprised: { browL: 'M252 172 Q270 158 288 168', browR: 'M312 168 Q330 158 348 172', eyes: 'wide', mouth: 'M300 254 a9 13 0 1 0 0.1 0', mouthFill: true },
  embarrassed: { browL: 'M252 182 L288 175', browR: 'M312 175 L348 182', eyes: 'lidded', mouth: 'M284 265 q8 -5 16 0 q8 5 16 0', blush: true },
  flirty: { browL: 'M252 182 L288 181', browR: 'M312 176 Q330 166 348 176', eyes: 'wink', mouth: 'M282 263 Q302 271 320 256', blush: true },
  worried: { browL: 'M252 184 Q270 170 290 173', browR: 'M310 173 Q330 170 348 184', eyes: 'open', mouth: 'M284 266 q8 -4 16 0 q8 4 16 0' },
  laughing: { browL: 'M252 178 Q270 164 288 172', browR: 'M312 172 Q330 164 348 178', eyes: 'closed', mouth: 'M276 255 Q300 292 324 255 Z', mouthFill: true },
};

function Eyes({ kind }: { kind: Face['eyes'] }) {
  const open = (x: number) => <ellipse cx={x} cy={207} rx={7} ry={5.5} fill={INK} />;
  const closed = (x: number) => <path d={`M${x - 9} 209 Q${x} 199 ${x + 9} 209`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
  const lidded = (x: number) => (
    <g>
      <path d={`M${x - 9} 205 L${x + 9} 205`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <path d={`M${x - 7} 205 a7 5 0 0 0 14 0`} fill={INK} />
    </g>
  );
  const wide = (x: number) => (
    <g>
      <circle cx={x} cy={206} r={9} fill="#fff" opacity={0.85} />
      <circle cx={x} cy={206} r={5} fill={INK} />
    </g>
  );
  const pick = { open, closed, lidded, wide, wink: open }[kind];
  return (
    <g>
      {pick(270)}
      {kind === 'wink' ? closed(330) : pick(330)}
    </g>
  );
}

function Hair({ spec, layer }: { spec: SilhouetteSpec; layer: 'back' | 'front' }) {
  const c = spec.hairColor;
  switch (spec.hair) {
    case 'bun':
      return layer === 'back' ? (
        <circle cx={300} cy={98} r={46} fill={c} />
      ) : (
        <g fill={c}>
          <path d="M218 205 Q214 108 300 104 Q386 108 382 205 Q372 150 300 142 Q232 150 218 205Z" />
          <path d="M226 170 q-10 60 4 110" stroke={c} strokeWidth={5} fill="none" />
        </g>
      );
    case 'curls_scarf':
      return layer === 'back' ? (
        <g fill={c}>
          {[
            [228, 170], [372, 170], [214, 230], [386, 230], [222, 290], [378, 290], [240, 330], [360, 330],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={44} />
          ))}
        </g>
      ) : (
        <g>
          <path d="M214 180 Q222 96 300 92 Q378 96 386 180 Q340 140 300 140 Q260 140 214 180Z" fill={c} />
          <path d="M210 160 Q300 96 390 160 L392 132 Q300 66 208 132Z" fill={spec.outfitAccent} />
          <circle cx={226} cy={292} r={7} fill="#e3c26b" />
        </g>
      );
    case 'pixie':
      return layer === 'back' ? null : (
        <path d="M216 200 Q206 102 300 98 Q392 102 384 196 Q370 150 340 140 Q300 168 248 150 Q228 160 216 200Z" fill={c} />
      );
    case 'bob':
      return layer === 'back' ? (
        <path d="M206 200 Q200 96 300 92 Q400 96 394 200 L398 296 L340 296 L340 200 L260 200 L260 296 L202 296Z" fill={c} />
      ) : (
        <path d="M212 196 Q208 104 300 100 Q392 104 388 196 Q350 134 300 158 Q252 132 212 196Z" fill={c} />
      );
    case 'bald_beard':
      return layer === 'back' ? null : (
        <path d="M228 236 Q232 330 300 340 Q368 330 372 236 Q350 280 300 284 Q250 280 228 236Z" fill={c} />
      );
  }
}

function PoseProp({ pose, spec }: { pose: string; spec: SilhouetteSpec }) {
  switch (pose) {
    case 'arms_crossed':
      return <rect x={168} y={598} width={264} height={78} rx={36} fill={spec.outfitAccent} stroke={INK} strokeOpacity={0.25} />;
    case 'clipboard':
      return (
        <g>
          <rect x={330} y={600} width={120} height={160} rx={6} fill="#e9e2d4" />
          <rect x={366} y={592} width={48} height={16} rx={4} fill="#777" />
        </g>
      );
    case 'notebook':
      return <rect x={250} y={610} width={100} height={130} rx={4} fill="#d8cdb4" transform="rotate(-8 300 670)" />;
    case 'bar':
      return <path d="M196 380 L246 372 L238 560 L200 560Z" fill="#f3efe6" opacity={0.9} />;
    case 'guitar':
      return (
        <g>
          <ellipse cx={330} cy={820} rx={110} ry={130} fill="#7a4a24" />
          <rect x={300} y={480} width={22} height={260} fill="#3a2414" transform="rotate(20 311 610)" />
          <circle cx={330} cy={810} r={30} fill="#1d120a" />
        </g>
      );
    default:
      return null;
  }
}

export const PlaceholderCharacter = memo(function PlaceholderCharacter({
  spec,
  pose,
  expression,
  color,
}: {
  spec: SilhouetteSpec;
  pose: string;
  expression: Expression;
  color: string;
}) {
  const b = spec.build ?? 1;
  const face = FACES[expression] ?? FACES.neutral;
  const outfit = pose === 'wetsuit' ? '#1b262e' : spec.outfit;
  const sh = 128 * b; // half shoulder width
  const wa = 86 * b; // half waist
  const hip = 104 * b;
  const hem = pose === 'coat' ? 1380 : 1500;
  const armsDown = pose !== 'arms_crossed';
  const id = `pc-${spec.hair}-${color.replace('#', '')}`;

  return (
    <svg viewBox="0 0 600 1500" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={`${id}-cloth`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(outfit, -0.28)} />
          <stop offset="0.55" stopColor={outfit} />
          <stop offset="1" stopColor={mix(outfit, color, 0.45)} />
        </linearGradient>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={shade(spec.skin, -0.14)} />
          <stop offset="1" stopColor={spec.skin} />
        </linearGradient>
      </defs>
      <g transform={pose === 'leaning' ? 'rotate(-3 300 1500)' : undefined}>
        <Hair spec={spec} layer="back" />
        {/* legs */}
        <path d={`M${300 - hip + 10} 900 L${300 - 30} 1500 L${300 + 30} 1500 L${300 + hip - 10} 900Z`} fill={INK} opacity={0.85} />
        {/* torso / coat */}
        <path
          d={`M${300 - sh} 380 Q300 352 ${300 + sh} 380 L${300 + sh + 6} 520 L${300 + wa} 760 L${300 + hip + (pose === 'coat' ? 40 : 0)} ${pose === 'coat' ? hem : 920} L${300 - hip - (pose === 'coat' ? 40 : 0)} ${pose === 'coat' ? hem : 920} L${300 - wa} 760 L${300 - sh - 6} 520Z`}
          fill={`url(#${id}-cloth)`}
        />
        {/* arms */}
        {armsDown ? (
          <g fill={`url(#${id}-cloth)`}>
            <path d={`M${300 - sh} 384 q-34 10 -40 70 L${300 - sh - 52} 860 L${300 - sh - 8} 866 L${300 - sh + 16} 520Z`} />
            <path d={`M${300 + sh} 384 q34 10 40 70 L${300 + sh + 52} 860 L${300 + sh + 8} 866 L${300 + sh - 16} 520Z`} />
          </g>
        ) : (
          <g fill={`url(#${id}-cloth)`}>
            <path d={`M${300 - sh} 384 q-34 10 -40 70 L${300 - sh - 30} 640 L${300 - sh + 30} 640 L${300 - sh + 16} 520Z`} />
            <path d={`M${300 + sh} 384 q34 10 40 70 L${300 + sh + 30} 640 L${300 + sh - 30} 640 L${300 + sh - 16} 520Z`} />
          </g>
        )}
        {/* neckline + neck */}
        <path d="M262 376 L300 450 L338 376Z" fill={spec.skin} />
        <rect x={272} y={290} width={56} height={92} rx={20} fill={`url(#${id}-skin)`} />
        {/* head */}
        <ellipse cx={300} cy={212} rx={80} ry={100} fill={`url(#${id}-skin)`} />
        <Hair spec={spec} layer="front" />
        {/* face */}
        <g>
          <path d={face.browL} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d={face.browR} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <Eyes kind={face.eyes} />
          <path d="M300 214 l-6 28 h10" stroke={INK} strokeOpacity={0.35} strokeWidth={2.5} fill="none" />
          <path
            d={face.mouth}
            stroke={INK}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill={face.mouthFill ? '#3a1d1f' : 'none'}
          />
          {face.blush && (
            <g fill="#e0607a" opacity={0.28}>
              <ellipse cx={256} cy={240} rx={20} ry={10} />
              <ellipse cx={344} cy={240} rx={20} ry={10} />
            </g>
          )}
        </g>
        <PoseProp pose={pose} spec={spec} />
      </g>
    </svg>
  );
});
