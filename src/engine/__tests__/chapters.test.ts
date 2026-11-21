import { describe, expect, it } from 'vitest';
import { advance, choose, continueToChapter, createNewGame } from '../dialogueEngine';
import { SceneManager } from '../sceneManager';
import { sampleStory } from '../storyWalker';
import { validateContent } from '../validator';
import { makeFixture } from './fixture';
import { C, choice, end, fx, narrate, option, rename, scene, setFlag, text, when } from '@/data/story/dsl';
import type { GameState } from '@/types';

function setup() {
  const c = makeFixture();
  c.chapters = [
    ...c.chapters,
    { id: 'one', title: 'One', startScene: 'a1' },
    { id: 'two', title: 'Two', startScene: 'b1' },
  ];
  c.scenes.a1 = scene('a1', 'one', 'A', [
    fx({ rain: 'heavy' }),
    text('b', 'Hi.', { as: 'Unknown number' }),
    choice('a_pick', [option('x', 'X', { effects: [setFlag('picked_x')] }), option('y', 'Y')]),
    end({ chapterComplete: true, nextChapter: 'two' }),
  ]);
  c.scenes.b1 = scene('b1', 'two', 'B', [
    when(C.flag('picked_x'), [narrate('You picked X.')], [narrate('You picked Y.')]),
    rename('b', null),
    narrate('Renamed.'),
    rename('b', 'Bee'),
    end({ chapterComplete: true }),
  ]);
  return { c, m: new SceneManager(c) };
}
const line = (s: GameState) => (s.presentation.kind === 'line' ? s.presentation.line.text : s.presentation.kind);

describe('chapters', () => {
  it('carries everything into the next chapter and clears only the screen', () => {
    const { m } = setup();
    let s = createNewGame(m, { playerName: 'Sam', startScene: 'a1' }).state;
    s = advance(m, s).state; // past the text, to the choice
    s = choose(m, s, 'x').state;
    expect(s.presentation).toMatchObject({ kind: 'end', nextChapter: 'two' });
    const r = continueToChapter(m, s);
    expect(r.state.pointer.scene).toBe('b1');
    expect(line(r.state)).toBe('You picked X.');
    expect(r.state.flags.picked_x).toBe(true);
    expect(r.state.phone.threads.b).toHaveLength(1);
    expect(r.state.stage.fx).toBeNull();
    expect(r.state.visitedScenes).toEqual(['a1', 'b1']);
  });

  it('refuses when there is no next chapter', () => {
    const { m } = setup();
    const s = createNewGame(m, { playerName: 'Sam', startScene: 'b1' }).state;
    expect(() => continueToChapter(m, s)).toThrow(/no chapter/);
  });

  it('renames a conversation, and can go back to the real name', () => {
    const { m } = setup();
    let s = createNewGame(m, { playerName: 'Sam', startScene: 'a1' }).state;
    expect(s.phone.names.b).toBe('Unknown number');
    s = continueToChapter(m, { ...s, presentation: { kind: 'end', nextChapter: 'two' } }).state;
    s = advance(m, s).state;
    expect(line(s)).toBe('Renamed.');
    expect(s.phone.names.b).toBeUndefined();
    s = advance(m, s).state;
    expect(s.phone.names.b).toBe('Bee');
  });

  it('samples through chapters, measuring each one', () => {
    const { m, c } = setup();
    expect(validateContent(c).filter((i) => i.level === 'error')).toEqual([]);
    const r = sampleStory(m, { startScene: 'a1', runs: 40, seed: 2, followChapters: true });
    expect(r.errors).toEqual([]);
    expect(r.unreachableOptions).toEqual([]);
    expect(Object.keys(r.chapterLines).sort()).toEqual(['one', 'two']);
    expect(r.chapterLines.two!.min).toBe(2);
  });
});
