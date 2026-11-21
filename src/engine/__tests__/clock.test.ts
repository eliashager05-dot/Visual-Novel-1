import { describe, expect, it } from 'vitest';
import { advance, choose, createNewGame } from '../dialogueEngine';
import { SceneManager } from '../sceneManager';
import { createSaveRecord, migrateRecord } from '../saveManager';
import { validateContent } from '../validator';
import { makeFixture } from './fixture';
import { C, clock, end, jump, mapChoice, narrate, option, scene, when } from '@/data/story/dsl';
import type { GameState } from '@/types';

function setup() {
  const c = makeFixture();
  c.scenes.ck = scene('ck', 'ch1', 'Clock', [
    narrate('No time yet.'),
    clock('evening', 1),
    narrate('Evening.'),
    clock('night'),
    when(C.time('night', 'late'), [narrate('It is dark.')], [narrate('It is light.')]),
    clock('morning', 'next'),
    when(C.day({ gte: 2 }), [narrate('Day two.')]),
    mapChoice('ck_where', 'town', [
      option('pier', 'Walk to the pier', { place: 'pier', goto: { scene: 's2' } }),
      option('inn', 'Go to the inn', { place: 'inn' }),
      option('nap', 'Nap at the inn', { place: 'inn', condition: C.flag('tired'), showWhenLocked: true }),
    ], 'Where?'),
    jump('s2'),
  ]);
  const m = new SceneManager(c);
  return { c, m, s0: createNewGame(m, { playerName: 'Sam', startScene: 'ck' }).state };
}
const text = (s: GameState) => (s.presentation.kind === 'line' ? s.presentation.line.text : s.presentation.kind);

describe('clock', () => {
  it('starts unset, then follows the story, carrying the day and moving to the next', () => {
    const { m, s0 } = setup();
    expect(s0.clock).toBeNull();
    const r1 = advance(m, s0);
    expect(r1.state.clock).toEqual({ day: 1, period: 'evening' });
    expect(r1.events).toContainEqual({ type: 'clock', clock: { day: 1, period: 'evening' } });
    const s2 = advance(m, r1.state).state;
    expect(s2.clock).toEqual({ day: 1, period: 'night' });
    expect(text(s2)).toBe('It is dark.');
    const s3 = advance(m, s2).state;
    expect(s3.clock).toEqual({ day: 2, period: 'morning' });
    expect(text(s3)).toBe('Day two.');
  });

  it('presents map choices with their places, and locked places stay visible', () => {
    const { m, s0 } = setup();
    let s = s0;
    for (let i = 0; i < 4; i++) s = advance(m, s).state;
    expect(s.presentation.kind).toBe('choice');
    if (s.presentation.kind !== 'choice') return;
    expect(s.presentation.choice.map).toBe('town');
    expect(s.presentation.choice.options.map((o) => [o.id, o.place, o.enabled])).toEqual([
      ['pier', 'pier', true],
      ['inn', 'inn', true],
      ['nap', 'inn', false],
    ]);
    expect(text(choose(m, s, 'pier').state)).not.toBe('choice');
  });

  it('is saved, and older saves load without a clock', () => {
    const { m, s0 } = setup();
    const s = advance(m, s0).state;
    const rec = createSaveRecord(m, s, 'quick', 'quick');
    expect(JSON.parse(JSON.stringify(rec)).state.clock).toEqual({ day: 1, period: 'evening' });
    const old = JSON.parse(JSON.stringify(rec));
    delete old.state.clock;
    old.schemaVersion = 4;
    expect(migrateRecord(old).state.clock).toBeNull();
  });

  it('validates maps, places and times of day', () => {
    const { c } = setup();
    expect(validateContent(c).filter((i) => i.level === 'error')).toEqual([]);
    c.scenes.bad = scene('bad', 'ch1', 'Bad', [
      clock('teatime' as never),
      mapChoice('bad_a', 'atlantis', [option('x', 'X', { place: 'pier' })]),
      mapChoice('bad_b', 'town', [option('y', 'Y', { place: 'moon' }), option('z', 'Z')]),
      { type: 'choice', id: 'bad_c', options: [option('w', 'W', { place: 'pier' })] },
      when(C.time(), [narrate('?')]),
      end(),
    ]);
    const msgs = validateContent(c).filter((i) => i.level === 'error').map((i) => i.message);
    expect(msgs).toEqual(
      expect.arrayContaining([
        'unknown time of day "teatime"',
        'unknown map "atlantis"',
        'map "town" has no place "moon"',
        'every option of a map choice needs a `place`',
        '`place` only works on a map choice',
        'time condition lists no times of day',
      ]),
    );
  });
});
