import { describe, expect, it } from 'vitest';
import { buildPrompt, listRenderItems } from './prompts';
import {
  classWord, datasetFolderName, isSoloOf, itemCaption, loraCharacters, loraTrigger, repeatsFor, trainingConfig, variation,
  variationCaption, variationPrompt,
} from './lora';

describe('LoRA training sets', () => {
  it('names a trigger and class per character', () => {
    expect(loraTrigger('noor')).toBe('hlcnoor');
    expect(classWord('noor')).toBe('woman');
    expect(classWord('player')).toBe('man');
    expect(loraCharacters()).toEqual(expect.arrayContaining(['player', 'vera', 'noor', 'june', 'sienna']));
  });

  it('captions describe what changes, never the face or hair', () => {
    const solo = listRenderItems().find((i) => i.kind === 'shots' && isSoloOf(i, 'noor'))!;
    const cap = itemCaption(solo, 'noor');
    expect(cap.startsWith('hlcnoor woman, ')).toBe(true);
    expect(cap).toMatch(/wearing /);
    expect(cap).not.toMatch(/curly-haired|curly hair|curls|brown eyes|mole/);
    const ref = listRenderItems().find((i) => i.id === 'ref_june')!;
    expect(itemCaption(ref, 'june')).not.toMatch(/pixie|copper|freckled|:1\.\d/);
  });

  it('makes varied pictures: framing, mood, place and outfit all change', () => {
    const vs = Array.from({ length: 12 }, (_, n) => variation('vera', n));
    expect(new Set(vs.map((v) => v.framing)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(vs.map((v) => v.expression)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(vs.map((v) => v.place)).size).toBeGreaterThanOrEqual(5);
    expect(new Set(vs.map((v) => JSON.stringify(v))).size).toBe(12);
    const p = variationPrompt('vera', 3);
    expect(p.positive).toMatch(/29 year old woman/); // generated with the full locked look
    expect(p.negative).toMatch(/two people/);
    expect(p.seed).not.toBe(variationPrompt('vera', 4).seed);
    expect(variationCaption('vera', 3)).toMatch(/^hlcvera woman, /);
    expect(variationCaption('vera', 3)).not.toMatch(/ash-blonde|scar/);
  });

  it('sizes repeats to the set and follows the folder convention', () => {
    expect(repeatsFor(15)).toBe(10);
    expect(repeatsFor(40)).toBe(4);
    expect(repeatsFor(1)).toBe(20);
    expect(datasetFolderName('sienna', 25)).toBe('6_hlcsienna woman');
  });

  it('writes a training config with safe Windows paths', () => {
    const toml = trainingConfig({ charId: 'noor', checkpoint: 'C:\\models\\sdxl.safetensors', imageDir: 'D:\\vn\\lora\\img', outputDir: 'D:\\vn\\lora\\out' });
    expect(toml).toContain("pretrained_model_name_or_path = 'C:\\models\\sdxl.safetensors'");
    expect(toml).toContain("output_name = 'noor'");
    expect(toml).toContain('network_train_unet_only = true');
  });

  it('puts the trigger word in prompts for characters with a LoRA', () => {
    const solo = listRenderItems().find((i) => i.kind === 'shots' && isSoloOf(i, 'noor'))!;
    expect(buildPrompt(solo, { triggers: { noor: 'hlcnoor' } }).positive).toMatch(/hlcnoor, a 26 year old woman/);
    expect(buildPrompt(solo).positive).not.toMatch(/hlcnoor/);
    const ref = listRenderItems().find((i) => i.id === 'ref_noor')!;
    expect(buildPrompt(ref, { triggers: { noor: 'hlcnoor' } }).positive).toMatch(/hlcnoor, a 26 year old/);
  });
});
