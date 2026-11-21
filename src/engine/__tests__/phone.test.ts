import { describe, expect, it } from 'vitest';
import { advance, choose, createNewGame } from '../dialogueEngine';
import { SceneManager } from '../sceneManager';
import { createSaveRecord, migrateRecord, restoreState } from '../saveManager';
import { validateContent } from '../validator';
import { makeFixture } from './fixture';
import { choice, end, jump, narrate, option, phone, photo, reply, scene, text } from '@/data/story/dsl';
import type { GameState } from '@/types';

function setup() {
  const c = makeFixture();
  c.cgs.pic = { id: 'pic', title: 'Pic', background: 'room', description: 'x', characters: [], placeholder: { palette: ['#000', '#111', '#222'] } };
  c.scenes.ph = scene('ph', 'ch1', 'Phone', [
    narrate('Before.'),
    text('b', 'Hi {player}.', { as: 'Unknown number' }),
    choice('ph_reply', [
      option('nice', 'Reply nicely', { steps: [reply('b', 'Hello!')] }),
      option('cold', 'Ignore it'),
    ]),
    phone(null),
    text('a', 'Psst.', { quiet: true }),
    photo('unknown', 'pic', { caption: 'Look.' }),
    photo('unknown', 'pic'),
    jump('s2'),
  ]);
  const m = new SceneManager(c);
  return { c, m, s0: createNewGame(m, { playerName: 'Sam', startScene: 'ph' }).state };
}
const line = (s: GameState) => (s.presentation.kind === 'line' ? s.presentation.line : null);

describe('phone', () => {
  it('opens the conversation, shows the message as a line and remembers the thread', () => {
    const { m, s0 } = setup();
    const s1 = advance(m, s0).state;
    expect(s1.stage.phone).toBe('b');
    expect(line(s1)).toMatchObject({ kind: 'text', thread: 'b', speakerName: 'Unknown number', text: 'Hi Sam.' });
    expect(s1.phone.threads.b).toEqual([{ from: 'them', text: 'Hi Sam.' }]);
    expect(s1.relationships.b!.met).toBe(false); // an unknown number does not count as meeting them
  });

  it('adds player replies, keeps the phone open across choices, and puts it away', () => {
    const { m, s0 } = setup();
    const atChoice = advance(m, advance(m, s0).state).state;
    expect(atChoice.presentation.kind).toBe('choice');
    expect(atChoice.stage.phone).toBe('b');
    const replied = choose(m, atChoice, 'nice').state;
    expect(line(replied)).toMatchObject({ kind: 'text', speaker: 'player', speakerName: 'Sam', text: 'Hello!' });
    expect(replied.phone.threads.b!.map((x) => x.from)).toEqual(['them', 'player']);
    const after = advance(m, replied).state;
    expect(after.stage.phone).toBe('unknown');
  });

  it('delivers quiet messages in the background with an unread count and an event', () => {
    const { m, s0 } = setup();
    const atChoice = advance(m, advance(m, s0).state).state;
    // Quiet "Psst." is delivered on the way to the photo, without stopping.
    const r = choose(m, atChoice, 'cold');
    expect(r.state.phone.threads.a).toEqual([{ from: 'them', text: 'Psst.' }]);
    expect(r.state.phone.unread.a).toBe(1);
    expect(r.events).toContainEqual({ type: 'phoneMessage', thread: 'a' });
  });

  it('shows photos, unlocks illustrations, records "[Photo]" in history, closes on a new scene', () => {
    const { m, s0 } = setup();
    // Ignoring the message runs on to the photo in the same step.
    const r = choose(m, advance(m, advance(m, s0).state).state, 'cold');
    expect(r.events).toContainEqual({ type: 'unlockGallery', id: 'pic' });
    let s = r.state;
    expect(s.history.at(-1)).toMatchObject({ kind: 'text', text: 'Look.' });
    expect(s.phone.threads.unknown).toEqual([{ from: 'them', image: 'pic', text: 'Look.' }]);
    expect(line(s)).toMatchObject({ speakerName: 'Unknown number', thread: 'unknown' });
    s = advance(m, s).state;
    expect(s.history.at(-1)).toMatchObject({ kind: 'text', text: '[Photo]' });
    s = advance(m, s).state;
    expect(s.pointer.scene).toBe('s2');
    expect(s.stage.phone).toBeNull();
  });

  it('survives saving, and migrates saves from before the phone', () => {
    const { m, s0 } = setup();
    const s1 = advance(m, s0).state;
    const rec = createSaveRecord(m, s1, 'manual-1', 'manual');
    expect(restoreState(m, rec).state.phone.threads.b).toHaveLength(1);
    const old = JSON.parse(JSON.stringify(rec));
    old.schemaVersion = 3;
    delete old.state.phone;
    delete old.state.stage.phone;
    const migrated = migrateRecord(old);
    expect(migrated.state.phone).toEqual({ threads: {}, names: {}, unread: {} });
    expect(migrated.state.stage.phone).toBeNull();
  });

  it('validates contacts and photos', () => {
    const { c } = setup();
    expect(validateContent(c).filter((i) => i.level === 'error')).toEqual([]);
    c.scenes.bad = scene('bad', 'ch1', 'Bad', [text('nobody', 'x'), photo('a', 'nopic'), end()]);
    const msgs = validateContent(c).map((i) => i.message);
    expect(msgs).toEqual(expect.arrayContaining(['unknown phone contact "nobody"', 'unknown photo "nopic" (use an illustration or shot id)']));
  });
});
