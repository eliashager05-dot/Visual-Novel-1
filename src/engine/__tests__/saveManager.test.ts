import { describe, expect, it } from 'vitest';
import { advance, choose, createNewGame, resume } from '../dialogueEngine';
import { SceneManager } from '../sceneManager';
import {
  createSaveRecord,
  memoryStorage,
  migrateRecord,
  restoreState,
  SaveError,
  SaveRepository,
  type SlotId,
} from '../saveManager';
import { makeFixture } from './fixture';
import { narrate, scene } from '@/data/story/dsl';
import type { GameState } from '@/types';

function atChoice() {
  const m = new SceneManager(makeFixture());
  const s0 = createNewGame(m, { playerName: 'Sam' }).state;
  return { m, s0, s1: advance(m, s0).state };
}

describe('save manager', () => {
  it('round-trips through storage and restores exactly', () => {
    const { m, s0 } = atChoice();
    const repo = new SaveRepository(memoryStorage());
    repo.write(createSaveRecord(m, s0, 'manual-1', 'manual', 1000));
    const rec = repo.read('manual-1')!;
    expect(rec.sceneTitle).toBe('Start');
    expect(rec.preview.text).toBe('Hello, Sam.');
    expect(rec.thumb.background).toBe('room');
    const { state, outcome } = restoreState(m, rec);
    expect(outcome).toBe('exact');
    expect(state).toEqual(s0);
  });

  it('preserves relationships and decisions', () => {
    const { m, s1 } = atChoice();
    const after = choose(m, s1, 'kind').state;
    const repo = new SaveRepository(memoryStorage());
    repo.write(createSaveRecord(m, after, 'quick', 'quick'));
    const { state } = restoreState(m, repo.read('quick')!);
    expect(state.relationships.a!.affinity).toBe(35);
    expect(state.choicesMade).toEqual({ c1: 'kind' });
    // And it keeps playing from there.
    expect(advance(m, state).state.presentation).toMatchObject({ kind: 'line', line: { text: 'She likes you.' } });
  });

  it('relocates to the same line when the scene was edited after saving', () => {
    const { m, s0 } = atChoice();
    const rec = createSaveRecord(m, s0, 'manual-2', 'manual');
    const edited = makeFixture();
    edited.scenes.s1!.steps.unshift(narrate('A brand new opening line.'));
    const m2 = new SceneManager(edited);
    const { state, outcome } = restoreState(m2, rec);
    expect(outcome).toBe('relocated');
    expect(state.presentation).toMatchObject({ kind: 'line', line: { text: 'Hello, Sam.' } });
    expect(advance(m2, state).state.presentation.kind).toBe('choice');
  });

  it('relocates a pending choice by id', () => {
    const { m, s1 } = atChoice();
    const rec = createSaveRecord(m, s1, 'manual-3', 'manual');
    const edited = makeFixture();
    edited.scenes.s1!.steps.unshift(narrate('Inserted.'));
    const m2 = new SceneManager(edited);
    const { state, outcome } = restoreState(m2, rec);
    expect(outcome).toBe('relocated');
    expect(choose(m2, state, 'kind').state.presentation).toMatchObject({ line: { text: 'Thanks!' } });
  });

  it('rewinds to the scene start when the saved line no longer exists', () => {
    const { m, s0 } = atChoice();
    const rec = createSaveRecord(m, s0, 'manual-4', 'manual');
    const edited = makeFixture();
    edited.scenes.s1 = scene('s1', 'ch1', 'Start', [narrate('Completely rewritten.'), { type: 'end' }]);
    const m2 = new SceneManager(edited);
    const r = restoreState(m2, rec);
    expect(r.outcome).toBe('rewound');
    expect(resume(m2, r.state).state.presentation).toMatchObject({ line: { text: 'Completely rewritten.' } });
  });

  it('refuses saves pointing at deleted scenes or from newer versions', () => {
    const { m, s0 } = atChoice();
    const rec = createSaveRecord(m, s0, 'manual-5', 'manual');
    const edited = makeFixture();
    delete edited.scenes.s1;
    expect(() => restoreState(new SceneManager(edited), rec)).toThrow(SaveError);
    expect(() => migrateRecord({ ...rec, schemaVersion: 999 })).toThrow(/newer version/);
    expect(() => migrateRecord({ hello: 1 })).toThrow(/Not a Halcyon save/);
  });

  it('migrates v1 saves without a shot field', () => {
    const { m, s0 } = atChoice();
    const rec = createSaveRecord(m, s0, 'manual-6', 'manual');
    const old = JSON.parse(JSON.stringify(rec));
    old.schemaVersion = 1;
    delete old.state.stage.shot;
    delete old.thumb.shot;
    const migrated = migrateRecord(old);
    expect(migrated.state.stage.shot).toBeNull();
    expect(migrated.thumb.shot).toBeNull();
  });

  it('rotates autosaves through the oldest slot and lists newest first', () => {
    const { m, s0 } = atChoice();
    const repo = new SaveRepository(memoryStorage());
    const slots: SlotId[] = [];
    for (let t = 1; t <= 5; t++) {
      const slot = repo.nextAutoSlot();
      slots.push(slot);
      repo.write(createSaveRecord(m, s0, slot, 'auto', t * 1000));
    }
    expect(slots).toEqual(['auto-1', 'auto-2', 'auto-3', 'auto-1', 'auto-2']);
    expect(repo.list().map((r) => r.createdAt)).toEqual([5000, 4000, 3000]);
    expect(repo.latest()!.slot).toBe('auto-2');
  });

  it('treats corrupt slots as empty and can clear everything', () => {
    const storage = memoryStorage();
    storage.set('halcyon:save:manual-1', '{not json');
    storage.set('unrelated', 'keep');
    const repo = new SaveRepository(storage);
    expect(repo.read('manual-1')).toBeNull();
    expect(repo.list()).toEqual([]);
    repo.clearAll();
    expect(storage.keys()).toEqual(['unrelated']);
  });

  it('save records are plain JSON', () => {
    const { m, s1 } = atChoice();
    const rec = createSaveRecord(m, s1, 'manual-1', 'manual');
    expect(JSON.parse(JSON.stringify(rec)) as { state: GameState }).toEqual(rec);
  });
});
