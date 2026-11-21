import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { content } from '@/data';
import { shotSrc } from '@/lib/assetResolver';
import { clockLabel } from '@/lib/clock';
import { useGameStore } from '@/store/gameStore';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';
import type { MapDefinition, PresentedChoice, PresentedOption, TimeOfDay } from '@/types';
import { Hints } from './ChoiceMenu';
import { IslandChart } from './IslandChart';

/** Where the map sits on the 1920×1080 canvas (16:9). */
const BOX = { left: 192, top: 118, width: 1536, height: 864 };

interface PlaceGroup {
  id: string;
  name: string;
  note?: string;
  x: number;
  y: number;
  options: { option: PresentedOption; number: number }[];
}

/**
 * A choice drawn as places on a map. Each pin is a place; a place can hold
 * several options (the hotel: the lobby, or stay in your room). Click a pin
 * with one option to go there, or open it to pick. Number keys pick options
 * directly, as in every other choice.
 */
export function MapChoice({ choice, onChoose }: { choice: PresentedChoice; onChoose: (id: string) => void }) {
  const map = content.maps[choice.map!];
  const clock = useGameStore((s) => s.game?.clock ?? null);
  const walkthrough = useSettings((s) => s.walkthrough);
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const groups = useMemo(() => groupByPlace(choice, map), [choice, map]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (useUi.getState().overlay !== 'none') return;
      const n = Number.parseInt(e.key, 10);
      if (n >= 1 && n <= choice.options.length) {
        const o = choice.options[n - 1]!;
        if (o.enabled) onChoose(o.id);
      } else if (e.key === 'Escape' && open) {
        e.stopPropagation();
        setOpen(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [choice, onChoose, open]);

  if (!map) return null;
  const art = map.image ? shotSrc(map.image) : null;
  const active = open ?? hover;

  const pick = (g: PlaceGroup) => {
    const enabled = g.options.filter((o) => o.option.enabled);
    if (enabled.length === 1 && g.options.length === 1) onChoose(enabled[0]!.option.id);
    else setOpen(open === g.id ? null : g.id);
  };

  return (
    <motion.div
      className="absolute inset-0 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(null);
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px]" />

      <div className="absolute inset-x-0 top-[34px] flex items-baseline justify-center gap-6">
        {choice.prompt && <div className="font-serif text-[46px] italic text-[#f3ead8]">{choice.prompt}</div>}
        {clock && <div className="text-[17px] uppercase tracking-[0.3em] text-[#e8c88f]/75">{clockLabel(clock)}</div>}
      </div>

      <motion.div
        className="absolute overflow-hidden rounded-[18px] shadow-[0_30px_100px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
        style={BOX}
        initial={{ scale: 0.97, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {art ? (
          <img src={art} alt={map.name} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        ) : (
          <IslandChart title={map.name} />
        )}
        <TimeTint period={clock?.period ?? null} />

        {groups.map((g) => {
          const anyEnabled = g.options.some((o) => o.option.enabled);
          const isActive = active === g.id;
          return (
            <button
              key={g.id}
              data-place={g.id}
              className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
              style={{ left: `${g.x}%`, top: `${g.y}%`, zIndex: isActive ? 5 : 2 }}
              onMouseEnter={() => setHover(g.id)}
              onMouseLeave={() => setHover((h) => (h === g.id ? null : h))}
              onFocus={() => setHover(g.id)}
              onClick={(e) => {
                e.stopPropagation();
                if (anyEnabled) pick(g);
                else setOpen(open === g.id ? null : g.id);
              }}
              aria-label={g.name}
            >
              <Pin active={isActive} enabled={anyEnabled} numbers={g.options.map((o) => o.number)} />
              <span
                className={[
                  'mt-2 whitespace-nowrap rounded-full px-4 py-1 font-serif text-[25px] font-semibold italic shadow-lg transition-colors',
                  anyEnabled ? 'bg-[#16130e]/85 text-[#f3ead8]' : 'bg-[#16130e]/60 text-white/40',
                  isActive && anyEnabled ? 'text-[#f0d49a]' : '',
                ].join(' ')}
              >
                {g.name}
              </span>
            </button>
          );
        })}

        <AnimatePresence>
          {active && (
            <PlaceCard
              key={active}
              group={groups.find((g) => g.id === active)!}
              pinned={open === active}
              walkthrough={walkthrough}
              onChoose={onChoose}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-x-0 bottom-[30px] text-center text-[16px] uppercase tracking-[0.3em] text-white/40">
        Choose a place · or press its number
      </div>
    </motion.div>
  );
}

function groupByPlace(choice: PresentedChoice, map: MapDefinition | undefined): PlaceGroup[] {
  if (!map) return [];
  const out: PlaceGroup[] = [];
  choice.options.forEach((option, i) => {
    const id = option.place ?? '';
    const place = map.places[id];
    if (!place) return;
    let g = out.find((x) => x.id === id);
    if (!g) {
      g = { id, name: place.name, note: place.note, x: place.x, y: place.y, options: [] };
      out.push(g);
    }
    g.options.push({ option, number: i + 1 });
  });
  return out;
}

function Pin({ active, enabled, numbers }: { active: boolean; enabled: boolean; numbers: number[] }) {
  return (
    <span className="relative flex items-center justify-center">
      {enabled && (
        <motion.span
          className="absolute h-[64px] w-[64px] rounded-full border-2 border-[#e8c88f]"
          animate={{ scale: [0.7, 1.35], opacity: [0.65, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span
        className={[
          'relative flex h-[50px] min-w-[50px] items-center justify-center rounded-full border-[3px] px-2 text-[19px] font-bold tabular-nums shadow-[0_6px_18px_rgba(0,0,0,0.55)] transition-all duration-150',
          enabled
            ? active
              ? 'scale-110 border-[#f0d49a] bg-[#2a2116] text-[#f0d49a]'
              : 'border-[#e8c88f] bg-[#16130e] text-[#e8c88f] group-hover:scale-110'
            : 'border-white/25 bg-[#16130e]/80 text-white/35',
        ].join(' ')}
      >
        {enabled ? (
          numbers.join('·')
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-label="Locked">
            <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </span>
    </span>
  );
}

function PlaceCard({ group, pinned, walkthrough, onChoose }: { group: PlaceGroup; pinned: boolean; walkthrough: boolean; onChoose: (id: string) => void }) {
  // Open toward the side with more room.
  const right = group.x > 58;
  const below = group.y < 38;
  return (
    <motion.div
      className="absolute w-[540px] rounded-2xl border border-white/10 bg-[#0e0d0b]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      style={{
        left: right ? undefined : `calc(${group.x}% + 52px)`,
        right: right ? `calc(${100 - group.x}% + 52px)` : undefined,
        top: below ? `calc(${group.y}% - 30px)` : undefined,
        bottom: below ? undefined : `calc(${100 - group.y}% - 30px)`,
        zIndex: 10,
        pointerEvents: pinned ? 'auto' : 'none',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-serif text-[32px] font-semibold italic text-[#f3ead8]">{group.name}</div>
      {group.note && <div className="mb-3 text-[17px] text-white/45">{group.note}</div>}
      <div className="flex flex-col gap-2">
        {group.options.map(({ option: o, number }) => (
          <button
            key={o.id}
            disabled={!o.enabled}
            onClick={() => onChoose(o.id)}
            className={[
              'flex items-start gap-4 rounded-xl px-4 py-3 text-left transition-colors',
              o.enabled ? 'bg-white/[0.04] text-white/90 hover:bg-[#2a2116] hover:text-white' : 'cursor-not-allowed text-white/35',
            ].join(' ')}
          >
            <span className="mt-1 w-5 shrink-0 text-center text-[17px] tabular-nums text-[#e8c88f]/70">{number}</span>
            <span className="flex flex-1 flex-col">
              <span className="text-[23px] font-semibold leading-snug">{o.text}</span>
              {!o.enabled && <span className="text-[17px] italic">{o.lockedHint ?? 'Unavailable'}</span>}
              {walkthrough && o.hints && <Hints hints={o.hints} />}
            </span>
          </button>
        ))}
      </div>
      {!pinned && group.options.some((o) => o.option.enabled) && (
        <div className="mt-3 text-[15px] uppercase tracking-[0.25em] text-white/35">
          {group.options.length === 1 ? 'Click to go' : 'Click to choose'}
        </div>
      )}
    </motion.div>
  );
}

/** Darkens and cools the map with the hour, so a midnight choice looks like midnight. */
function TimeTint({ period }: { period: TimeOfDay | null }) {
  const tint: Partial<Record<TimeOfDay, string>> = {
    dawn: 'rgba(90,70,120,0.18)',
    dusk: 'rgba(120,60,30,0.22)',
    evening: 'rgba(20,30,70,0.38)',
    night: 'rgba(8,14,40,0.55)',
    late: 'rgba(5,8,28,0.62)',
  };
  const color = period ? tint[period] : undefined;
  if (!color) return null;
  return <div className="pointer-events-none absolute inset-0" style={{ background: color, mixBlendMode: 'multiply' }} />;
}
