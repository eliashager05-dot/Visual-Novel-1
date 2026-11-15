import { content } from '@/data';
import { locations, renderSheets } from '@/data/renderSheets';
import { SceneManager } from '@/engine/sceneManager';
import type { CameraFraming, Expression, ShotCharacter, StagePosition } from '@/types';

/**
 * Builds image-generation prompts from the story data: the shot brief, each
 * character's locked look and the outfit for that scene, the expression, the
 * camera framing and the location's lighting. Pure functions, no I/O.
 */

export type RenderKind = 'shots' | 'cg' | 'refs';

export interface RenderItem {
  id: string;
  kind: RenderKind;
  title: string;
  /** Scene that first uses it (drives outfits and production order). */
  scene: string | null;
  sceneTitle: string;
  brief: string;
  characters: string[];
}

export interface BuiltPrompt {
  positive: string;
  negative: string;
  /** Stable base seed for this item; variants add to it. */
  seed: number;
}

export const DEFAULT_STYLE =
  'photorealistic cinematic film still, photograph, realistic skin texture with visible pores, natural detailed hair, ' +
  'soft motivated lighting, shallow depth of field, subtle film grain, high detail';

/** Always applied. Keeps people adult, clothed and photographic, and discourages common artefacts. */
export const DEFAULT_NEGATIVE =
  'child, children, teenager, underage, young-looking, school uniform, ' +
  'nudity, nsfw, ' +
  'cartoon, anime, illustration, painting, drawing, sketch, cgi, plastic skin, airbrushed, doll, ' +
  'deformed, extra fingers, extra limbs, fused fingers, bad hands, bad anatomy, cross-eyed, duplicate person, ' +
  'text, caption, subtitles, watermark, logo, signature, frame, border, blurry, low quality';

const FRAMING: Record<CameraFraming, string> = {
  wide: 'wide establishing shot',
  medium: 'medium shot, waist up',
  close: 'close-up portrait, head and shoulders',
  extreme_close: 'extreme close-up of faces',
  over_shoulder: 'over-the-shoulder shot, foreground figure out of focus',
};

const EXPRESSION: Record<Expression, string> = {
  neutral: 'calm neutral expression',
  happy: 'soft genuine smile',
  sad: 'sad, downcast eyes',
  angry: 'controlled anger, set jaw',
  surprised: 'surprised, eyebrows raised, lips parted',
  embarrassed: 'flustered, slight blush, glancing away',
  flirty: 'playful smirk, one eyebrow raised',
  worried: 'worried, furrowed brow',
  laughing: 'laughing openly, eyes creased',
};

const ORDER: StagePosition[] = ['farLeft', 'left', 'center', 'right', 'farRight'];
const SIDE: Record<StagePosition, string> = {
  farLeft: 'in the left foreground',
  left: 'on the left',
  center: 'in the centre',
  right: 'on the right',
  farRight: 'on the far right',
};

/** FNV-1a → positive 31-bit integer. */
function seedFor(id: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % 2147483647;
}

const sheetOf = (charId: string) => renderSheets.find((s) => s.character === charId);

/** How the brief should refer to each person, since names mean nothing to an image model. */
const ALIAS: Record<string, string> = {
  player: 'the dark-haired man',
  vera: 'the blonde woman',
  noor: 'the curly-haired woman',
  june: 'the red-haired woman',
  sienna: 'the woman with the black bob',
  bram: 'the bald bearded man',
};

/** "a 26 year old woman, …, wearing …, soft genuine smile" */
function describeCharacter(c: ShotCharacter, sceneId: string | null, withExpression = true): string {
  const sheet = sheetOf(c.id);
  if (!sheet) return content.characters[c.id]?.appearance ?? c.id;
  const outfit = (sceneId && sheet.wardrobe.find((w) => w.scenes.includes(sceneId))) || sheet.wardrobe[0];
  const parts = [`a ${sheet.prompt}`];
  if (outfit) parts.push(`wearing ${outfit.prompt}`);
  if (withExpression) parts.push(EXPRESSION[c.expression ?? 'neutral']);
  return parts.join(', ');
}

/** Removes notes meant for a 3D artist and replaces names with visual labels. */
function cleanBrief(text: string): string {
  let out = text
    .replace(/\((?:players? choose[^)]*|anonymous[^)]*)\)/gi, '')
    // A note addressed to the artist rather than describing the image.
    .replace(/\bThis is the player[^.]*\.\s*/gi, '')
    .replace(/,?\s*for continuity\b/gi, '');
  // "the protagonist" and "the player" both mean him.
  out = out.replace(/\b[Tt]he (?:protagonist|player)(’s|'s)?/g, (_m, poss?: string) => `${ALIAS.player}${poss ?? ''}`);
  for (const [id, alias] of Object.entries(ALIAS)) {
    const def = content.characters[id];
    if (!def || id === 'player') continue;
    const name = def.shortName ?? def.name;
    out = out.replace(new RegExp(`\\b${name}\\b`, 'g'), alias);
  }
  return out
    .replace(/\bSame (?:framing|light|car)[^.]*\.\s*/gi, '')
    .replace(/\bInsert(?:\/close)?:\s*/gi, '')
    .replace(/\b\d{2,3} mm(?: macro(?: feel)?)?[^.]*\./gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

let cachedItems: RenderItem[] | null = null;

/** Every image the game needs, in story order: shots and illustrations per scene, then character references. */
export function listRenderItems(): RenderItem[] {
  if (cachedItems) return cachedItems;
  const manager = new SceneManager(content);
  const items: RenderItem[] = [];
  const seen = new Set<string>();
  for (const def of Object.values(content.scenes)) {
    for (const i of manager.getScene(def.id).instructions) {
      if (i.type === 'shot' && i.id && !seen.has(`s:${i.id}`)) {
        seen.add(`s:${i.id}`);
        const s = content.shots[i.id]!;
        items.push({ id: s.id, kind: 'shots', title: s.id, scene: def.id, sceneTitle: def.title, brief: s.description, characters: s.characters.map((c) => c.id) });
      }
      if (i.type === 'cg' && i.id && !seen.has(`c:${i.id}`)) {
        seen.add(`c:${i.id}`);
        const c = content.cgs[i.id]!;
        items.push({ id: c.id, kind: 'cg', title: c.title, scene: def.id, sceneTitle: def.title, brief: c.description, characters: c.characters });
      }
    }
  }
  for (const sheet of renderSheets) {
    const def = content.characters[sheet.character]!;
    items.push({
      id: `ref_${sheet.character}`,
      kind: 'refs',
      title: def.name,
      scene: null,
      sceneTitle: 'Character references',
      brief: `Reference portrait of ${def.name}: ${def.appearance}`,
      characters: [sheet.character],
    });
  }
  cachedItems = items;
  return items;
}

export function buildPrompt(
  item: RenderItem,
  opts: { style?: string; negative?: string; extra?: string } = {},
): BuiltPrompt {
  const style = opts.style ?? DEFAULT_STYLE;
  // Image models weight the start of a prompt most, so the subject comes first and the style last.
  const parts: string[] = [];

  if (item.kind === 'refs') {
    const charId = item.characters[0]!;
    const sheet = sheetOf(charId)!;
    parts.push(
      'studio portrait, head and shoulders, facing the camera, plain grey backdrop, soft even light',
      `a ${sheet.prompt}`,
      `wearing ${sheet.wardrobe[0]!.prompt}`,
      'calm neutral expression',
    );
  } else {
    const shot = item.kind === 'shots' ? content.shots[item.id] : undefined;
    const cg = item.kind === 'cg' ? content.cgs[item.id] : undefined;
    const background = shot?.background ?? cg?.background ?? '';
    const loc = locations.find((l) => l.background === background);

    const empty = shot ? shot.characters.length === 0 : (cg?.characters.length ?? 0) === 0;
    if (!shot) parts.push('wide cinematic composition');
    else if (empty && shot.camera !== 'wide') parts.push('close-up detail shot of an object');
    else parts.push(FRAMING[shot.camera]);

    // People, left to right, each with their locked look and this scene's outfit.
    const people: ShotCharacter[] = shot
      ? [...shot.characters].sort((a, b) => ORDER.indexOf(a.position ?? 'center') - ORDER.indexOf(b.position ?? 'center'))
      : (cg?.characters ?? []).map((id) => ({ id }));
    // Illustrations describe their own mood, so they carry no separate expression.
    const withExpression = Boolean(shot);
    if (people.length === 1) {
      parts.push(describeCharacter(people[0]!, item.scene, withExpression));
    } else if (people.length > 1) {
      parts.push(`${people.length} people`);
      for (const p of people) {
        const where = shot ? `${SIDE[p.position ?? 'center']}: ` : '';
        parts.push(`${where}${describeCharacter(p, item.scene, withExpression)}`);
      }
    } else if (shot?.camera === 'wide') {
      parts.push('no people');
    }

    parts.push(cleanBrief(item.brief));
    // The first two sentences of the lighting brief carry the look; the rest is notes on how it changes.
    if (loc) parts.push(`${content.backgrounds[background]?.name ?? ''}. ${loc.lighting.split('. ').slice(0, 2).join('. ')}`);
  }

  if (opts.extra?.trim()) parts.push(opts.extra.trim());
  parts.push(style);

  // A person's avoid list only applies when they are alone in the image; with several
  // people, "long hair" for one would also push everyone else's hair shorter.
  const avoid = item.characters.length === 1 ? sheetOf(item.characters[0]!)?.avoid : undefined;
  const negative = [DEFAULT_NEGATIVE, avoid, opts.negative].filter(Boolean).join(', ');
  return { positive: parts.filter(Boolean).join('. ').replace(/\.\./g, '.'), negative, seed: seedFor(item.id) };
}
