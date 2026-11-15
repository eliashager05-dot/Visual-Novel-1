import { describe, expect, it } from 'vitest';
import { content } from '@/data';
import { renderSheets } from '@/data/renderSheets';
import { buildPrompt, DEFAULT_NEGATIVE, listRenderItems } from './prompts';

const items = listRenderItems();

describe('image prompts', () => {
  it('covers every shot, every illustration and one reference per character', () => {
    expect(items.filter((i) => i.kind === 'shots').length).toBe(Object.keys(content.shots).length);
    expect(items.filter((i) => i.kind === 'cg').length).toBe(Object.keys(content.cgs).length);
    expect(items.filter((i) => i.kind === 'refs').map((i) => i.characters[0]).sort()).toEqual(Object.keys(content.characters).sort());
  });

  it('states an adult age for every person in every prompt', () => {
    for (const item of items) {
      const { positive } = buildPrompt(item);
      for (const id of item.characters) {
        const sheet = renderSheets.find((s) => s.character === id)!;
        const age = /(\d+) year old/.exec(sheet.prompt);
        expect(age, `${id} has no age in its prompt`).not.toBeNull();
        expect(Number(age![1])).toBeGreaterThanOrEqual(21);
        expect(positive, `${item.id} is missing ${id}'s identity`).toContain(sheet.prompt);
      }
    }
  });

  it('always blocks minors, nudity and non-photographic styles', () => {
    for (const item of items) {
      const { negative } = buildPrompt(item, { negative: 'extra thing' });
      for (const term of ['child', 'teenager', 'underage', 'nudity', 'cartoon', 'watermark']) expect(negative).toContain(term);
      expect(negative).toContain('extra thing');
    }
    expect(DEFAULT_NEGATIVE).toContain('young-looking');
  });

  it('uses the outfit for the scene the shot belongs to', () => {
    const p = (id: string) => buildPrompt(items.find((i) => i.id === id)!).positive;
    expect(p('c1_ferry_noor_call')).toContain('an orange scarf knotted in her curls');
    expect(p('c1_noor_piano_close')).toContain('no scarf');
    expect(p('c1_vera_desk_close')).toContain('grey cardigan');
    expect(p('c1_storm_vera_close')).toContain('soaked navy waterproof jacket');
  });

  it('orders people left to right and names the framing', () => {
    const { positive } = buildPrompt(items.find((i) => i.id === 'c1_ferry_noor_beside')!);
    expect(positive).toContain('2 people');
    expect(positive.indexOf('on the left: a 26 year old woman')).toBeGreaterThan(-1);
    expect(positive.indexOf('on the left')).toBeLessThan(positive.indexOf('on the right: a 25 year old man'));
    expect(positive).toContain('medium shot');
  });

  it('strips notes meant for a 3D artist and never asks for a legible name', () => {
    for (const item of items) {
      const { positive } = buildPrompt(item);
      expect(positive).not.toMatch(/\b\d{2,3} mm\b/);
      expect(positive).not.toMatch(/players? choose/i);
    }
  });

  it('is deterministic and applies per-item extra text', () => {
    const item = items[0]!;
    expect(buildPrompt(item)).toEqual(buildPrompt(item));
    expect(buildPrompt(item, { extra: 'heavier fog' }).positive).toContain('heavier fog');
    expect(buildPrompt(items[1]!).seed).not.toBe(buildPrompt(item).seed);
  });

  it('puts the subject first and the style last', () => {
    const { positive } = buildPrompt(items.find((i) => i.id === 'ref_june')!);
    expect(positive.startsWith('studio portrait')).toBe(true);
    expect(positive.endsWith('high detail')).toBe(true);
    expect(positive).toContain('pixie haircut');
  });

  it("applies a person's avoid list only when they are alone in the image", () => {
    const alone = buildPrompt(items.find((i) => i.id === 'ref_june')!);
    expect(alone.negative).toContain('shoulder-length hair');
    const together = buildPrompt(items.find((i) => i.id === 'c1_june_stairs')!);
    expect(together.negative).not.toContain('shoulder-length hair');
  });
});
