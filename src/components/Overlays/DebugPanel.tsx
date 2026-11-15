import { useEffect, useState } from 'react';
import { content } from '@/data';
import { getTier } from '@/engine';
import { useGameStore } from '@/store/gameStore';

/** Writer/QA tool — development builds only. Toggle with the backtick key. */
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const game = useGameStore((s) => s.game);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === '`' && setOpen((o) => !o);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (!open || !game) return null;
  return (
    <div
      className="absolute left-4 top-4 z-[60] max-h-[700px] w-[520px] overflow-auto rounded-lg bg-black/85 p-5 font-mono text-[14px] text-white/80"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-2 text-[#e8c88f]">
        {game.pointer.scene} #{game.pointer.index} · lines {game.lineCount}
      </div>
      {Object.values(content.characters).map((d) => {
        const r = game.relationships[d.id];
        if (!r) return null; // the protagonist has no relationship entry
        return (
          <div key={d.id}>
            <span style={{ color: d.color }}>{d.id}</span> aff {r.affinity} · trust {r.trust} · {getTier(d, r.affinity).label}
            {r.met ? '' : ' · (not met)'} {r.milestones.join(',')}
          </div>
        );
      })}
      <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify({ flags: game.flags, vars: game.vars, choices: game.choicesMade }, null, 1)}</pre>
    </div>
  );
}
