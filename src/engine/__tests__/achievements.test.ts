import { describe, expect, it } from 'vitest';
import { achievements } from '@/data/achievements';
import { content } from '@/data';
import { validateContent } from '../validator';
import { advance, choose, createNewGame } from '../dialogueEngine';
import { SceneManager } from '../sceneManager';
import { isEarned, newlyEarned, type AchievementDefinition } from '../achievements';
import { makeFixture } from './fixture';
import { C } from '@/data/story/dsl';

const none = { scenesSeen: {}, chaptersCompleted: {} };

describe('achievements', () => {
  const m = new SceneManager(makeFixture());
  const defs: AchievementDefinition[] = [
    { id: 'kind', title: 'Kind', description: '', rule: { kind: 'condition', condition: C.milestone('a', 'm1') } },
    { id: 'both', title: 'Both', description: '', rule: { kind: 'scenesSeen', scenes: ['s1', 's2'] } },
    { id: 'done', title: 'Done', description: '', rule: { kind: 'chapterComplete', chapter: 'ch1' } },
  ];

  it('earns condition achievements from the current playthrough only once', () => {
    const s0 = createNewGame(m, { playerName: 'x' }).state;
    const s1 = choose(m, advance(m, s0).state, 'kind').state;
    expect(newlyEarned(defs, {}, s0, none).map((d) => d.id)).toEqual([]);
    expect(newlyEarned(defs, {}, s1, none).map((d) => d.id)).toEqual(['kind']);
    expect(newlyEarned(defs, { kind: 1 }, s1, none)).toEqual([]);
  });

  it('combines scenes seen in earlier playthroughs with the current one', () => {
    const s0 = createNewGame(m, { playerName: 'x' }).state; // has visited s1
    expect(isEarned(defs[1]!, s0, none)).toBe(false);
    expect(isEarned(defs[1]!, s0, { scenesSeen: { s2: true }, chaptersCompleted: {} })).toBe(true);
    expect(isEarned(defs[1]!, null, { scenesSeen: { s1: true, s2: true }, chaptersCompleted: {} })).toBe(true);
  });

  it('reads completed chapters from lasting progress', () => {
    expect(isEarned(defs[2]!, null, { scenesSeen: {}, chaptersCompleted: { ch1: true } })).toBe(true);
  });

  it('game achievements have unique ids and reference real content', () => {
    const ids = achievements.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    const scenes = achievements.flatMap((a) => (a.rule.kind === 'scenesSeen' ? a.rule.scenes : []));
    for (const s of scenes) expect(content.scenes[s], s).toBeDefined();
    // Conditions are checked by the content validator by wrapping them in a throwaway scene.
    const conds = achievements.flatMap((a) => (a.rule.kind === 'condition' ? [a.rule.condition] : []));
    const issues = validateContent({
      ...content,
      scenes: { ...content.scenes, _achv: { id: '_achv', chapter: 'ch1', title: 'probe', steps: [{ type: 'if', condition: C.all(...conds), then: [], else: [] }, { type: 'end' }] } },
    }).filter((i) => i.level === 'error');
    expect(issues).toEqual([]);
  });
});
