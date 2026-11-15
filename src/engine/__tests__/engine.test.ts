import { describe, expect, it } from 'vitest';
import { advance, choose, createNewGame } from '../dialogueEngine';
import { SceneManager } from '../sceneManager';
import { compileScene } from '../sceneCompiler';
import { validateContent } from '../validator';
import { getTier, isRevealed, visibleProfile } from '../relationshipEngine';
import { char, makeFixture } from './fixture';
import type { GameState } from '@/types';
import { jump, label, narrate, scene } from '@/data/story/dsl';

const lineText = (s: GameState) => (s.presentation.kind === 'line' ? s.presentation.line.text : null);

function start() {
  const m = new SceneManager(makeFixture());
  return { m, ...createNewGame(m, { playerName: 'Sam' }) };
}

describe('dialogue engine', () => {
  it('runs staging instructions and stops at the first line, interpolating the player name', () => {
    const { state } = start();
    expect(lineText(state)).toBe('Hello, Sam.');
    expect(state.stage.background).toBe('room');
    expect(state.stage.characters).toEqual([{ id: 'a', position: 'left', pose: 'standing', expression: 'happy' }]);
    expect(state.relationships.a!.met).toBe(true);
    expect(state.relationships.b!.met).toBe(false);
    expect(state.visitedScenes).toEqual(['s1']);
  });

  it('presents choices, hiding locked options unless showWhenLocked', () => {
    const { m, state } = start();
    const s = advance(m, state).state;
    expect(s.presentation.kind).toBe('choice');
    if (s.presentation.kind !== 'choice') return;
    expect(s.presentation.choice.options.map((o) => [o.id, o.enabled])).toEqual([
      ['kind', true],
      ['rude', true],
      ['secret', false],
      ['leave', true],
    ]);
    expect(s.presentation.choice.options[2]!.lockedHint).toBe('nope');
    // advance() is a no-op while a choice is pending.
    expect(advance(m, s).state).toBe(s);
  });

  it('applies effects, runs inline branches and evaluates conditional dialogue', () => {
    const { m, state } = start();
    const atChoice = advance(m, state).state;
    const r = choose(m, atChoice, 'kind');
    expect(lineText(r.state)).toBe('Thanks!');
    expect(r.state.relationships.a!.affinity).toBe(35);
    expect(r.state.relationships.a!.milestones).toEqual(['m1']);
    expect(r.state.choicesMade).toEqual({ c1: 'kind' });
    expect(r.events).toContainEqual({ type: 'relationshipChanged', character: 'a', stat: 'affinity', delta: 25 });
    expect(r.events).toContainEqual({ type: 'milestone', character: 'a', milestone: 'm1' });
    const next = advance(m, r.state).state;
    expect(lineText(next)).toBe('She likes you.');
  });

  it('takes the else branch and clamps stats at 0', () => {
    const { m, state } = start();
    const r = choose(m, advance(m, state).state, 'rude');
    expect(r.state.relationships.a!.affinity).toBe(0);
    expect(r.events).toContainEqual({ type: 'relationshipChanged', character: 'a', stat: 'affinity', delta: -10 });
    expect(r.state.flags.was_rude).toBe(true);
    expect(lineText(r.state)).toBe('She is unsure.');
  });

  it('follows cross-scene jumps, including to labels, and ends', () => {
    const { m, state } = start();
    let s = choose(m, advance(m, state).state, 'leave').state;
    expect(lineText(s)).toBe('Late label.');
    expect(s.visitedScenes).toEqual(['s1', 's2']);
    const r = advance(m, s);
    s = r.state;
    expect(s.presentation).toEqual({ kind: 'end', ending: 'demo' });
    expect(r.events).toContainEqual({ type: 'ending', id: 'demo' });
  });

  it('never mutates the previous state (safe for undo/rollback and React)', () => {
    const { m, state } = start();
    const frozen = JSON.stringify(state);
    const atChoice = advance(m, state).state;
    choose(m, atChoice, 'kind');
    expect(JSON.stringify(state)).toBe(frozen);
    expect(atChoice.presentation.kind).toBe('choice');
  });

  it('rejects locked options', () => {
    const { m, state } = start();
    expect(() => choose(m, advance(m, state).state, 'secret')).toThrow(/locked/);
  });

  it('records history including the chosen option', () => {
    const { m, state } = start();
    const s = choose(m, advance(m, state).state, 'kind').state;
    expect(s.history.map((h) => h.text)).toEqual(['Hello, Sam.', 'Be kind', 'Thanks!']);
  });

  it('state round-trips through JSON (save compatibility)', () => {
    const { m, state } = start();
    const atChoice = advance(m, state).state;
    const restored = JSON.parse(JSON.stringify(atChoice)) as GameState;
    expect(lineText(choose(m, restored, 'kind').state)).toBe('Thanks!');
  });

  it('falls back to the default player name', () => {
    const m = new SceneManager(makeFixture());
    expect(createNewGame(m, { playerName: '   ' }).state.player.name).toBe('Default');
  });

  it('detects infinite loops instead of hanging', () => {
    const c = makeFixture();
    c.scenes.loop = scene('loop', 'ch1', 'Loop', [label('x'), jump({ label: 'x' })]);
    const m = new SceneManager(c);
    expect(() => createNewGame(m, { playerName: 'x', startScene: 'loop' })).toThrow(/infinite loop/);
  });
});

describe('scene compiler', () => {
  it('rejects unknown labels and duplicate choice ids', () => {
    expect(() => compileScene(scene('x', 'ch1', 'x', [jump({ label: 'nope' })]))).toThrow(/unknown label/);
    expect(() =>
      compileScene(
        scene('x', 'ch1', 'x', [
          { type: 'choice', id: 'dup', options: [{ id: 'a', text: 'a' }] },
          { type: 'choice', id: 'dup', options: [{ id: 'a', text: 'a' }] },
        ]),
      ),
    ).toThrow(/duplicate choice/);
  });

  it('produces a flat program with no nested steps', () => {
    const c = compileScene(makeFixture().scenes.s1!);
    for (const i of c.instructions) expect(['if', 'label']).not.toContain(i.type);
  });
});

describe('relationship engine', () => {
  it('reveals profile entries and tiers progressively', () => {
    const m = new SceneManager(makeFixture());
    let s = createNewGame(m, { playerName: 'x' }).state;
    const def = m.content.characters.a!;
    expect(visibleProfile(def, s).map((p) => p.id)).toEqual(['basic']);
    expect(isRevealed(m.content.characters.b!, s)).toBe(false);
    s = choose(m, advance(m, s).state, 'kind').state;
    expect(visibleProfile(def, s).map((p) => p.id)).toEqual(['basic', 'secret']);
    expect(getTier(def, 35).label).toBe('Friendly');
  });
});

describe('validator', () => {
  it('accepts the fixture', () => {
    expect(validateContent(makeFixture()).filter((i) => i.level === 'error')).toEqual([]);
  });

  it('rejects characters under 21', () => {
    const c = makeFixture();
    c.characters.young = char('young', 20);
    expect(validateContent(c).some((i) => i.level === 'error' && /below the minimum/.test(i.message))).toBe(true);
  });

  it('catches broken references', () => {
    const c = makeFixture();
    c.scenes.bad = scene('bad', 'ch1', 'Bad', [
      { type: 'background', id: 'nowhere' },
      { type: 'say', speaker: 'ghost', text: 'boo' },
      { type: 'show', character: 'a', pose: 'flying' },
      jump('missing'),
    ]);
    const msgs = validateContent(c).map((i) => i.message);
    expect(msgs).toEqual(
      expect.arrayContaining([
        'unknown background "nowhere"',
        'unknown character "ghost"',
        'a has no pose "flying"',
        'jump to unknown scene "missing"',
      ]),
    );
  });

  it('flags scenes that fall through', () => {
    const c = makeFixture();
    c.scenes.s2 = scene('s2', 'ch1', 'S2', [narrate('no end')]);
    expect(validateContent(c).some((i) => /fall through/.test(i.message))).toBe(true);
  });
});
