import { content } from '@/data';
import type { Expression } from '@/types';
import { ALIAS, cleanBrief, DEFAULT_NEGATIVE, DEFAULT_STYLE, EXPRESSION, FRAMING, seedFor, sheetOf, type RenderItem } from './prompts';

/**
 * Character LoRA training sets. A LoRA is a small add-on model trained on
 * 15–40 pictures of one character; with it, the image generator draws the
 * same face every time. These helpers turn the pictures you picked into a
 * training folder with captions, and make extra varied pictures to pick from.
 *
 * Captions follow the usual rule for character LoRAs: name the character
 * with the trigger word, then describe only what CHANGES between pictures
 * (outfit, framing, expression, place, light). What is never described (face,
 * hair, eyes) is what the LoRA learns as "this character".
 *
 * Pure functions, no I/O.
 */

/** The word that calls up the character once the LoRA is loaded. Rare on purpose. */
export const loraTrigger = (charId: string) => `hlc${charId.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;

/** "woman" or "man", from the character sheet. */
export function classWord(charId: string): 'woman' | 'man' {
  return /\bman\b/i.test(sheetOf(charId)?.prompt ?? '') ? 'man' : 'woman';
}

/** Characters a LoRA can be trained for: everyone with a character sheet. */
export const loraCharacters = (): string[] =>
  Object.keys(content.characters).filter((id) => sheetOf(id));

const pronoun = (charId: string) => (classWord(charId) === 'man' ? 'his' : 'her');

/** One varied picture for the training set. Several per outfit, so outfits are not learned as identity. */
export interface Variation {
  framing: string;
  expression: Expression;
  place: string;
}

const PLACES = [
  'plain grey studio backdrop, soft even light',
  'outdoors on a harbour quay, overcast daylight',
  'indoors by a window, warm lamp light, evening',
  'on a windy beach, bright natural light',
  'in a wood-panelled hotel lobby, warm light',
  'outdoors at dusk, golden rim light',
];

const FRAMINGS = (charId: string) => [
  'close-up portrait, head and shoulders, facing the camera',
  'close-up portrait, three-quarter view',
  'medium shot, waist up, looking slightly away from the camera',
  'profile view, head and shoulders',
  'full body shot, standing',
  `medium shot, looking back over ${pronoun(charId)} shoulder`,
  'close-up portrait, looking down',
  'medium shot, sitting',
];

const MOODS: Expression[] = ['neutral', 'happy', 'laughing', 'worried', 'neutral', 'surprised', 'flirty', 'sad'];

/** The n-th variation (0-based). Cycles framing, expression and place at different rates so they mix. */
export function variation(charId: string, n: number): Variation {
  const framings = FRAMINGS(charId);
  return {
    framing: framings[n % framings.length]!,
    expression: MOODS[(n * 3) % MOODS.length]!,
    place: PLACES[(n * 5 + Math.floor(n / PLACES.length)) % PLACES.length]!,
  };
}

/** Outfit for the n-th variation: cycles through the character's wardrobe. */
export function variationOutfit(charId: string, n: number): string {
  const wardrobe = sheetOf(charId)?.wardrobe ?? [];
  return wardrobe.length ? wardrobe[Math.floor(n / 2) % wardrobe.length]!.prompt : '';
}

/** Generation prompt for the n-th variation. Uses the full locked description, like every other image. */
export function variationPrompt(charId: string, n: number, style = DEFAULT_STYLE): { positive: string; negative: string; seed: number } {
  const sheet = sheetOf(charId);
  const v = variation(charId, n);
  const outfit = variationOutfit(charId, n);
  const positive = [
    v.framing,
    `a ${sheet?.prompt ?? content.characters[charId]?.appearance ?? charId}`,
    outfit && `wearing ${outfit}`,
    EXPRESSION[v.expression],
    v.place,
    'only one person in the image',
    style,
  ]
    .filter(Boolean)
    .join('. ');
  const negative = [DEFAULT_NEGATIVE, 'two people, crowd', sheet?.avoid].filter(Boolean).join(', ');
  return { positive, negative, seed: seedFor(`lora_${charId}`) + n };
}

/**
 * Outfit text for a caption: without the weights syntax "(words:1.3)", and
 * with hair TYPE words neutralised ("knotted in her curls" → "in her hair"),
 * since the hair itself is identity. How it is worn (bun, loose, tied back)
 * does change, so that stays.
 */
const plain = (s: string) =>
  s
    .replace(/\(([^():]+):[\d.]+\)/g, '$1')
    .replace(/\bcurls\b/gi, 'hair')
    .replace(/\s{2,}/g, ' ')
    .trim();

export function variationCaption(charId: string, n: number): string {
  const v = variation(charId, n);
  const outfit = variationOutfit(charId, n);
  return [`${loraTrigger(charId)} ${classWord(charId)}`, v.framing, outfit && `wearing ${plain(outfit)}`, EXPRESSION[v.expression], v.place]
    .filter(Boolean)
    .join(', ');
}

/** Caption for one of the game's own images (a reference portrait, shot or illustration) of this character. */
export function itemCaption(item: RenderItem, charId: string): string {
  const who = `${loraTrigger(charId)} ${classWord(charId)}`;
  const sheet = sheetOf(charId);
  if (item.kind === 'refs') {
    const outfit = sheet?.wardrobe[0]?.prompt;
    return [who, 'studio portrait, head and shoulders, facing the camera, plain grey backdrop, soft even light', outfit && `wearing ${plain(outfit)}`, EXPRESSION.neutral]
      .filter(Boolean)
      .join(', ');
  }
  const shot = item.kind === 'shots' ? content.shots[item.id] : undefined;
  const person = shot?.characters.find((c) => c.id === charId);
  const outfit = (item.scene && sheet?.wardrobe.find((w) => w.scenes.includes(item.scene!))) || sheet?.wardrobe[0];
  // The brief names people by look ("the curly-haired woman"): that is identity, so it becomes the trigger.
  const alias = ALIAS[charId];
  let brief = cleanBrief(item.brief);
  if (alias) brief = brief.replaceAll(alias, `the ${who}`).replaceAll(alias[0]!.toUpperCase() + alias.slice(1), `The ${who}`);
  return [
    who,
    shot ? FRAMING[shot.camera] : 'cinematic composition',
    outfit && `wearing ${plain(outfit.prompt)}`,
    person ? EXPRESSION[person.expression ?? 'neutral'] : '',
    brief.replace(/\.$/, ''),
  ]
    .filter(Boolean)
    .join(', ');
}

/** True when an image shows only this character: the only kind worth training on. */
export const isSoloOf = (item: RenderItem, charId: string) => item.characters.length === 1 && item.characters[0] === charId;

/**
 * kohya's folder convention: "<repeats>_<trigger> <class>". Repeats are set so
 * a typical run (10 epochs) lands near 1,500 training steps whatever the
 * number of pictures.
 */
export function repeatsFor(imageCount: number): number {
  return Math.min(20, Math.max(2, Math.round(150 / Math.max(1, imageCount))));
}
export const datasetFolderName = (charId: string, imageCount: number) => `${repeatsFor(imageCount)}_${loraTrigger(charId)} ${classWord(charId)}`;

export const MIN_IMAGES = 10;
export const GOOD_IMAGES = 20;

/**
 * Training settings for kohya's sd-scripts (sdxl_train_network.py --config_file),
 * chosen to fit an 8 GB card such as an RTX 2080: rank 16, U-Net only, cached
 * latents and text encoder outputs, gradient checkpointing, fp16.
 * Paths are written as TOML literal strings, so Windows backslashes are safe.
 */
export function trainingConfig(p: { charId: string; checkpoint: string; imageDir: string; outputDir: string }): string {
  return [
    '# Training settings for this character LoRA. See docs/LORA_GUIDE.md.',
    '# Made for 8 GB graphics cards (RTX 2080). With 12 GB or more you can raise resolution to 1024 and dim to 32.',
    '',
    `pretrained_model_name_or_path = '${p.checkpoint}'`,
    `train_data_dir = '${p.imageDir}'`,
    `output_dir = '${p.outputDir}'`,
    `output_name = '${p.charId}'`,
    "save_model_as = 'safetensors'",
    '',
    "caption_extension = '.txt'",
    "resolution = '896,896'",
    'enable_bucket = true',
    'min_bucket_reso = 512',
    'max_bucket_reso = 1280',
    '',
    "network_module = 'networks.lora'",
    'network_dim = 16',
    'network_alpha = 8',
    'network_train_unet_only = true',
    '',
    "optimizer_type = 'AdamW8bit'",
    'learning_rate = 1e-4',
    'unet_lr = 1e-4',
    "lr_scheduler = 'cosine'",
    'lr_warmup_steps = 50',
    'max_train_epochs = 10',
    'train_batch_size = 1',
    'save_every_n_epochs = 2',
    'seed = 42',
    '',
    "mixed_precision = 'fp16'",
    "save_precision = 'fp16'",
    'no_half_vae = true',
    'gradient_checkpointing = true',
    'cache_latents = true',
    'cache_latents_to_disk = true',
    'cache_text_encoder_outputs = true',
    'sdpa = true',
    'max_data_loader_n_workers = 1',
    '',
  ].join('\n');
}
