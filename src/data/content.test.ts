import { describe, expect, it } from 'vitest';
import { content } from '@/data';
import { SceneManager, validateContent, walkStory } from '@/engine';

describe('story content', () => {
  it('passes validation with no errors', () => {
    const issues = validateContent(content);
    const errors = issues.filter((i) => i.level === 'error');
    expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
  });

  it('every character is 21 or older', () => {
    for (const c of Object.values(content.characters)) expect(c.age).toBeGreaterThanOrEqual(21);
  });

  it('every branch of every chapter plays to an end without errors', () => {
    const manager = new SceneManager(content);
    for (const chapter of content.chapters) {
      const r = walkStory(manager, { startScene: chapter.startScene });
      expect(r.errors, JSON.stringify(r.errors, null, 2)).toEqual([]);
      expect(r.truncated).toBe(false);
      expect(r.paths).toBeGreaterThan(0);
      expect(r.unreachableOptions).toEqual([]);
    }
  });
});
