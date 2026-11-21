import { useEffect, useRef } from 'react';
import { content } from '@/data';
import { contactName } from '@/engine';
import { sceneManager, useGameStore as gameStore } from '@/store/gameStore';
import { useSettings } from '@/store/settingsStore';
import { useUi } from '@/store/uiStore';

/**
 * Turns relationship events into subtle notifications. One toast per
 * character per step, phrased in story terms rather than numbers.
 */
export function useEventToasts() {
  const events = gameStore((s) => s.events);
  const seen = useRef(new WeakSet<object>());

  useEffect(() => {
    if (seen.current.has(events)) return; // StrictMode re-run / no new events
    seen.current.add(events);
    const { pushToast } = useUi.getState();
    // Message notices always show: they tell you there is something to read.
    const game = gameStore.getState().game;
    for (const e of events) {
      if (e.type === 'phoneMessage' && game) pushToast({ tone: 'info', text: `New message · ${contactName(sceneManager, game, e.thread)}` });
    }
    if (!useSettings.getState().relationshipNotices) return;
    const perCharacter = new Map<string, { affinity: number; trust: number }>();
    for (const e of events) {
      if (e.type === 'relationshipChanged') {
        const cur = perCharacter.get(e.character) ?? { affinity: 0, trust: 0 };
        cur[e.stat] += e.delta;
        perCharacter.set(e.character, cur);
      } else if (e.type === 'milestone') {
        const def = content.characters[e.character];
        const m = def?.milestones.find((x) => x.id === e.milestone);
        if (def && m) pushToast({ tone: 'milestone', text: `${def.shortName ?? def.name} · ${m.title}`, color: def.color });
      }
    }
    for (const [id, d] of perCharacter) {
      const def = content.characters[id];
      if (!def) continue;
      const name = def.shortName ?? def.name;
      if (d.affinity > 0) pushToast({ tone: 'up', text: `${name} will remember that.`, color: def.color });
      else if (d.affinity < 0) pushToast({ tone: 'down', text: `${name} didn't like that.`, color: def.color });
      else if (d.trust > 0) pushToast({ tone: 'up', text: `${name} trusts you a little more.`, color: def.color });
      else if (d.trust < 0) pushToast({ tone: 'down', text: `${name} trusts you a little less.`, color: def.color });
    }
  }, [events]);
}
