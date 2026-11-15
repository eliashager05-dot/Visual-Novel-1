import { describe, expect, it } from 'vitest';
import { content } from '@/data';
import { SceneManager, sampleStory, validateContent } from '@/engine';

const manager = new SceneManager(content);

describe('story content', () => {
  it('passes validation with no errors', () => {
    const issues = validateContent(content);
    const errors = issues.filter((i) => i.level === 'error');
    expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
  });

  it('every character is 21 or older', () => {
    for (const c of Object.values(content.characters)) expect(c.age).toBeGreaterThanOrEqual(21);
  });

  // Chapter One branches into thousands of paths, so we sample: seeded random
  // playthroughs must hit every option at least once and never error.
  it('random playthroughs of every chapter reach the end, covering every option', () => {
    for (const chapter of content.chapters) {
      const r = sampleStory(manager, { startScene: chapter.startScene, runs: 1200, seed: 7 });
      expect(r.errors.slice(0, 3), JSON.stringify(r.errors.slice(0, 3), null, 2)).toEqual([]);
      expect(r.runs).toBe(1200);
      expect(r.unreachableOptions).toEqual([]);
      const scenesInChapter = Object.values(content.scenes).filter((s) => s.chapter === chapter.id).map((s) => s.id);
      expect(scenesInChapter.filter((s) => !r.scenesReached.has(s))).toEqual([]);
    }
  }, 120_000);

  it('Chapter One is a 20–30 minute read on every path', () => {
    const r = sampleStory(manager, { startScene: 'c1_ferry', runs: 300, seed: 11 });
    // ~3.5 s per line at default text speed (typing + reading) → 340–515 lines.
    expect(r.lines.min).toBeGreaterThanOrEqual(300);
    expect(r.lines.max).toBeLessThanOrEqual(560);
  }, 60_000);
});
