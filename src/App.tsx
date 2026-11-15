import { useEffect, useState } from 'react';
import { content } from './data';
import { getTier, isRevealed } from './engine';
import { useGameStore } from './store/gameStore';
import { usePersistentStore } from './store/persistentStore';

/**
 * Phase 1 engine harness: a deliberately plain screen that drives the real
 * engine end-to-end (new game → lines → choices → relationships → end).
 * Phase 2 replaces this with the cinematic interface; the store API stays.
 */
export default function App() {
  const game = useGameStore((s) => s.game);
  return game ? <Harness /> : <Start />;
}

function Start() {
  const newGame = useGameStore((s) => s.newGame);
  const [name, setName] = useState(content.defaultPlayerName);
  return (
    <div className="flex h-full items-center justify-center">
      <form
        className="w-80 space-y-4 rounded-xl border border-white/10 bg-white/5 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          newGame(name);
        }}
      >
        <h1 className="font-serif text-3xl tracking-wide">Halcyon</h1>
        <p className="text-xs uppercase tracking-widest text-white/40">Engine harness · Phase 1</p>
        <label className="block text-sm text-white/70">
          Your name
          <input
            className="mt-1 w-full rounded bg-black/40 px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-white/40"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button className="w-full rounded bg-white/90 py-2 text-black hover:bg-white" type="submit">
          New game
        </button>
      </form>
    </div>
  );
}

function Harness() {
  const { game, advance, choose, quitToTitle, events, error } = useGameStore();
  const readCount = usePersistentStore((s) => Object.keys(s.readLines).length);
  const gallery = Object.keys(usePersistentStore((s) => s.unlockedGallery));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance]);

  if (!game) return null;
  const p = game.presentation;
  const bgDef = game.stage.background ? content.backgrounds[game.stage.background] : null;
  const cgDef = game.stage.cg ? content.cgs[game.stage.cg] : null;
  const palette = (cgDef ?? bgDef)?.placeholder.palette;

  return (
    <div className="grid h-full grid-cols-[1fr_320px]">
      <main
        className="relative flex cursor-pointer flex-col justify-end"
        style={palette ? { background: `linear-gradient(${palette[0]}, ${palette[1]} 55%, ${palette[2]})` } : undefined}
        onClick={() => advance()}
      >
        <div className="absolute left-4 top-4 rounded bg-black/50 px-3 py-1 text-xs text-white/70">
          {cgDef ? `CG: ${cgDef.title}` : bgDef ? bgDef.name : 'No background'} · scene {game.pointer.scene}
        </div>
        <div className="absolute inset-x-0 top-1/3 flex justify-around px-10">
          {game.stage.characters.map((c) => {
            const def = content.characters[c.id]!;
            return (
              <div key={c.id} className="rounded-lg border px-4 py-6 text-center" style={{ borderColor: def.color }}>
                <div style={{ color: def.color }}>{def.shortName ?? def.name}</div>
                <div className="text-xs text-white/60">
                  {c.position} · {c.pose} · {c.expression}
                </div>
              </div>
            );
          })}
        </div>

        <div className="m-6 min-h-40 rounded-xl bg-black/70 p-6 backdrop-blur" onClick={(e) => p.kind === 'choice' && e.stopPropagation()}>
          {error && <p className="mb-2 text-red-400">Engine error: {error}</p>}
          {p.kind === 'line' && (
            <>
              {p.line.speakerName && (
                <div className="mb-1 font-semibold" style={{ color: p.line.speaker && p.line.speaker !== 'player' ? content.characters[p.line.speaker]?.color : '#ddd' }}>
                  {p.line.speakerName}
                </div>
              )}
              <p className={p.line.kind === 'say' ? '' : 'italic text-white/80'}>{p.line.text}</p>
            </>
          )}
          {p.kind === 'title' && (
            <div className="text-center font-serif">
              <div className="text-3xl">{p.title}</div>
              {p.subtitle && <div className="text-white/60">{p.subtitle}</div>}
            </div>
          )}
          {p.kind === 'choice' && (
            <div className="space-y-2">
              {p.choice.prompt && <p className="text-white/70">{p.choice.prompt}</p>}
              {p.choice.options.map((o) => (
                <button
                  key={o.id}
                  disabled={!o.enabled}
                  title={o.lockedHint}
                  onClick={() => choose(o.id)}
                  className="block w-full rounded border border-white/15 px-4 py-2 text-left hover:bg-white/10 disabled:opacity-40"
                >
                  {o.text}
                </button>
              ))}
            </div>
          )}
          {p.kind === 'end' && (
            <div className="space-y-3">
              <p className="text-white/70">End of available content.</p>
              <button onClick={quitToTitle} className="rounded bg-white/90 px-4 py-2 text-black">
                Back to title
              </button>
            </div>
          )}
          <p className="mt-4 text-[10px] uppercase tracking-widest text-white/30">Click / Space / Enter to advance</p>
        </div>
      </main>

      <aside className="space-y-5 overflow-y-auto border-l border-white/10 bg-neutral-950 p-4 text-sm">
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">Relationships</h2>
          {Object.values(content.characters)
            .filter((d) => d.role === 'major' && isRevealed(d, game))
            .map((d) => {
              const r = game.relationships[d.id]!;
              return (
                <div key={d.id} className="mb-2">
                  <div className="flex justify-between">
                    <span style={{ color: d.color }}>{d.shortName}</span>
                    <span className="text-white/50">{getTier(d, r.affinity).label}</span>
                  </div>
                  <div className="text-xs text-white/60">
                    affinity {r.affinity} · trust {r.trust}
                  </div>
                </div>
              );
            })}
        </section>
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">Flags & choices</h2>
          <pre className="whitespace-pre-wrap text-xs text-white/60">
            {JSON.stringify({ flags: game.flags, choices: game.choicesMade }, null, 1)}
          </pre>
        </section>
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">Last events</h2>
          <pre className="whitespace-pre-wrap text-xs text-white/60">{JSON.stringify(events, null, 1)}</pre>
        </section>
        <section className="text-xs text-white/50">
          Lines read (all-time): {readCount} · Gallery: {gallery.join(', ') || '—'}
        </section>
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">History</h2>
          <ol className="space-y-1 text-xs text-white/60">
            {game.history.slice(-12).map((h, i) => (
              <li key={i}>
                {h.kind === 'choice' ? '▸ ' : ''}
                {h.speakerName && <b>{h.speakerName}: </b>}
                {h.text}
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
