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

describe('production data', () => {
  it('every character has a render sheet, and outfits reference real scenes', async () => {
    const { renderSheets } = await import('@/data/renderSheets');
    const sheets = new Map(renderSheets.map((s) => [s.character, s]));
    for (const id of Object.keys(content.characters)) expect(sheets.has(id), `missing render sheet for ${id}`).toBe(true);
    const outfitIds = new Set<string>();
    for (const s of renderSheets) {
      expect(content.characters[s.character], `sheet for unknown character ${s.character}`).toBeDefined();
      for (const w of s.wardrobe) {
        expect(outfitIds.has(w.id), `duplicate outfit id ${w.id}`).toBe(false);
        outfitIds.add(w.id);
        for (const sc of w.scenes) expect(content.scenes[sc], `outfit ${w.id} references unknown scene ${sc}`).toBeDefined();
      }
    }
  });

  it('every character has an outfit for every scene they appear in', async () => {
    const { renderSheets } = await import('@/data/renderSheets');
    const missing: string[] = [];
    for (const scene of manager.compileAll()) {
      const present = new Set<string>();
      for (const i of scene.instructions) {
        if (i.type === 'say' && i.speaker !== 'player') present.add(i.speaker);
        if (i.type === 'shot' && i.id) for (const c of content.shots[i.id]?.characters ?? []) present.add(c.id);
      }
      for (const id of present) {
        const sheet = renderSheets.find((s) => s.character === id);
        if (!sheet?.wardrobe.some((w) => w.scenes.includes(scene.id))) missing.push(`${id} in ${scene.id}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('every background belongs to a described set', async () => {
    const { locations, sets } = await import('@/data/renderSheets');
    const setIds = new Set(sets.map((s) => s.id));
    const covered = new Set(locations.map((l) => l.background));
    for (const id of Object.keys(content.backgrounds)) expect(covered.has(id), `no location brief for ${id}`).toBe(true);
    for (const l of locations) {
      expect(content.backgrounds[l.background], `location brief for unknown background ${l.background}`).toBeDefined();
      expect(setIds.has(l.set), `unknown set ${l.set}`).toBe(true);
    }
  });
});
