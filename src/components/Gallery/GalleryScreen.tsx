import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { content } from '@/data';
import { usePersistentStore } from '@/store/persistentStore';
import { CharacterPortrait } from '../CharacterRenderer/CharacterPortrait';
import { Panel } from '../Overlays/Panel';
import { CgImage } from '../Stage/CgLayer';
import { Tabs } from '../ui/controls';

type Tab = 'cg' | 'characters' | 'scenes';

/**
 * Unlocks are per player (they persist across playthroughs). Locked items are
 * shown as anonymous tiles — never their titles — to avoid spoilers.
 */
export function GalleryScreen({ onClose, onReplay }: { onClose: () => void; onReplay: (sceneId: string) => void }) {
  const [tab, setTab] = useState<Tab>('cg');
  const [viewing, setViewing] = useState<string | null>(null);
  const unlockedCg = usePersistentStore((s) => s.unlockedGallery);
  const met = usePersistentStore((s) => s.charactersMet);
  const unlockedScenes = usePersistentStore((s) => s.unlockedScenes);

  const cgs = Object.values(content.cgs);
  const people = Object.values(content.characters).filter((d) => d.role !== 'protagonist');
  const replayable = Object.values(content.scenes).filter((s) => s.replayable);

  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setViewing(null);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [viewing]);

  const count = (n: number, total: number) => `${n} / ${total}`;

  return (
    <>
      <Panel title="Gallery" onClose={onClose} width={1560}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { value: 'cg', label: `Illustrations ${count(cgs.filter((c) => unlockedCg[c.id]).length, cgs.length)}` },
            { value: 'characters', label: `Characters ${count(people.filter((p) => met[p.id]).length, people.length)}` },
            { value: 'scenes', label: `Scenes ${count(replayable.filter((s) => unlockedScenes[s.id]).length, replayable.length)}` },
          ]}
        />
        <div className="min-h-[640px] overflow-y-auto px-12 py-8">
          {tab === 'cg' && (
            <div className="grid grid-cols-4 gap-6">
              {cgs.map((c) =>
                unlockedCg[c.id] ? (
                  <button key={c.id} onClick={() => setViewing(c.id)} className="group overflow-hidden rounded-2xl border border-white/[0.08] text-left hover:border-[#e8c88f]/50">
                    <div className="relative h-[187px] w-full overflow-hidden">
                      <div className="absolute left-0 top-0 origin-top-left" style={{ width: 1920, height: 1080, transform: 'scale(0.173)' }}>
                        <CgImage id={c.id} still />
                      </div>
                    </div>
                    <div className="bg-black/60 px-4 py-3 font-serif text-[22px] italic text-white/85">{c.title}</div>
                  </button>
                ) : (
                  <LockedTile key={c.id} height={187 + 52} />
                ),
              )}
            </div>
          )}

          {tab === 'characters' && (
            <div className="grid grid-cols-5 gap-6">
              {people.map((d) =>
                met[d.id] ? (
                  <div key={d.id} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <CharacterPortrait id={d.id} size={240} />
                    <div className="mt-3 text-[24px]" style={{ color: d.color }}>
                      {d.name}
                    </div>
                    <div className="text-[16px] text-white/50">{d.occupation}</div>
                    <div className="mt-2 text-[15px] text-white/40">Age {d.age}</div>
                  </div>
                ) : (
                  <LockedTile key={d.id} height={360} label="Not yet met" />
                ),
              )}
            </div>
          )}

          {tab === 'scenes' && (
            <div className="space-y-3">
              {replayable.length === 0 && <p className="text-white/40">No replayable scenes yet.</p>}
              {replayable.map((s) => {
                const chapter = content.chapters.find((c) => c.id === s.chapter);
                return unlockedScenes[s.id] ? (
                  <div key={s.id} className="flex items-center justify-between rounded-2xl border border-white/[0.08] px-6 py-4">
                    <div>
                      <div className="text-[15px] uppercase tracking-[0.25em] text-white/35">{chapter?.title}</div>
                      <div className="font-serif text-[30px] text-white/90">{s.title}</div>
                    </div>
                    <button
                      onClick={() => onReplay(s.id)}
                      className="rounded-full border border-white/20 px-8 py-3 text-[16px] uppercase tracking-[0.25em] text-white/80 hover:border-[#e8c88f]/60 hover:text-white"
                    >
                      Replay
                    </button>
                  </div>
                ) : (
                  <div key={s.id} className="rounded-2xl border border-white/[0.05] px-6 py-6 text-[18px] italic text-white/25">
                    Locked scene
                  </div>
                );
              })}
              <p className="pt-4 text-[15px] text-white/35">Replays use default relationships and are never saved.</p>
            </div>
          )}
        </div>
      </Panel>

      <AnimatePresence>
        {viewing && (
          <motion.div
            className="absolute inset-0 z-[60] cursor-zoom-out bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setViewing(null);
            }}
          >
            <CgImage id={viewing} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function LockedTile({ height, label = 'Locked' }: { height: number; label?: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.015] text-[16px] uppercase tracking-[0.3em] text-white/20" style={{ height }}>
      {label}
    </div>
  );
}
