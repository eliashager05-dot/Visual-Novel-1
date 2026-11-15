import { motion } from 'framer-motion';
import { useState } from 'react';
import { content } from '@/data';
import { getTier, isRevealed, visibleProfile } from '@/engine';
import type { Expression, GameState } from '@/types';
import { CharacterPortrait } from '../CharacterRenderer/CharacterPortrait';
import { Panel } from '../Overlays/Panel';

/** Portrait mood reflects how they feel about you — without printing spoilers. */
function moodFor(affinity: number): Expression {
  if (affinity >= 60) return 'happy';
  if (affinity >= 30) return 'neutral';
  return 'worried';
}

export function RelationshipScreen({ game, onClose }: { game: GameState; onClose: () => void }) {
  const people = Object.values(content.characters).filter((d) => isRevealed(d, game));
  const majors = people.filter((d) => d.role === 'major');
  const others = people.filter((d) => d.role !== 'major');
  const [selected, setSelected] = useState(majors[0]?.id ?? others[0]?.id ?? null);
  const def = selected ? content.characters[selected] : undefined;
  const rel = def ? game.relationships[def.id] : undefined;

  return (
    <Panel title="Relationships" onClose={onClose} width={1560}>
      {people.length === 0 ? (
        <p className="px-12 py-16 text-[22px] text-white/45">You haven't met anyone yet.</p>
      ) : (
        <div className="grid min-h-[700px] grid-cols-[380px_1fr]">
          <nav className="space-y-2 border-r border-white/[0.07] p-6">
            {[...majors, ...others].map((d) => {
              const r = game.relationships[d.id]!;
              const active = d.id === selected;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={[
                    'flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors',
                    active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]',
                  ].join(' ')}
                >
                  <CharacterPortrait id={d.id} size={72} expression={moodFor(r.affinity)} />
                  <div className="min-w-0">
                    <div className="truncate text-[22px]" style={{ color: d.color }}>
                      {d.shortName ?? d.name}
                    </div>
                    <div className="text-[15px] text-white/45">{d.role === 'major' ? getTier(d, r.affinity).label : 'Supporting'}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {def && rel && (
            <motion.div key={def.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="flex gap-10 p-10">
              <CharacterPortrait id={def.id} size={340} expression={moodFor(rel.affinity)} />
              <div className="min-w-0 flex-1 space-y-7">
                <div>
                  <div className="font-serif text-[52px] leading-none" style={{ color: def.color }}>
                    {def.name}
                  </div>
                  <div className="mt-2 text-[20px] text-white/55">{def.occupation}</div>
                </div>

                {def.role === 'major' && (
                  <div className="space-y-4">
                    <Meter label="Affinity" value={rel.affinity} color={def.color} caption={getTier(def, rel.affinity).label} />
                    <Meter label="Trust" value={rel.trust} color="#c9d4e6" />
                  </div>
                )}

                <dl className="space-y-3">
                  {visibleProfile(def, game).map((p) => (
                    <div key={p.id} className="grid grid-cols-[140px_1fr] gap-4 text-[19px]">
                      <dt className="text-[15px] uppercase tracking-[0.2em] text-white/35">{p.label}</dt>
                      <dd className="text-white/80">{p.text}</dd>
                    </div>
                  ))}
                </dl>

                {def.milestones.length > 0 && (
                  <div>
                    <div className="mb-3 text-[15px] uppercase tracking-[0.25em] text-white/35">Moments</div>
                    <ul className="space-y-2">
                      {def.milestones
                        .filter((m) => rel.milestones.includes(m.id))
                        .map((m) => (
                          <li key={m.id} className="rounded-xl border border-white/[0.07] px-5 py-3">
                            <div className="font-serif text-[24px] italic" style={{ color: def.color }}>
                              ✦ {m.title}
                            </div>
                            <div className="text-[17px] text-white/60">{m.description}</div>
                          </li>
                        ))}
                    </ul>
                    {(() => {
                      const remaining = def.milestones.length - rel.milestones.length;
                      return remaining > 0 ? (
                        <div className="mt-3 text-[17px] italic text-white/35">
                          {remaining === def.milestones.length ? 'No shared moments yet' : `${remaining} more to discover`}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Panel>
  );
}

function Meter({ label, value, color, caption }: { label: string; value: number; color: string; caption?: string }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[15px] uppercase tracking-[0.25em] text-white/40">{label}</span>
        <span className="text-[18px] tabular-nums text-white/70">
          {caption && <span className="mr-3 italic text-white/50">{caption}</span>}
          {value} / 100
        </span>
      </div>
      <div className="h-[6px] overflow-hidden rounded-full bg-white/10">
        <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
      </div>
    </div>
  );
}
