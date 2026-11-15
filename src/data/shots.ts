import { byId } from '@/engine/content';
import type { ShotDefinition } from '@/types';

/**
 * Shot list. Each entry is one full-frame 1920×1080 render. The `description`
 * is the brief for the render artist; set `src` when the render is delivered.
 * Run `npm run brief` to regenerate docs/RENDER_BRIEF.md from this file.
 *
 * House style (see docs/ART_DIRECTION.md): photoreal 3D, natural skin, soft
 * motivated lighting, shallow depth of field, 35–85 mm lens language.
 */
export const shots = byId<ShotDefinition>(
  [
    // --- Chapter 1 · The Crossing ------------------------------------------
    {
      id: 'c1_ferry_establish',
      background: 'ferry_deck_dusk',
      camera: 'wide',
      characters: [],
      description:
        'Empty stern deck of a small car ferry at dusk. Wet steel, coiled rope, orange life ring. The island is a dark hump on the horizon with a lighthouse and a few lit windows. Low sun behind clouds, cold blue shadows, warm rim on the railings. 24 mm, eye level.',
    },
    {
      id: 'c1_ferry_noor_call',
      background: 'ferry_deck_dusk',
      camera: 'medium',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'worried', position: 'right', facing: 'left' }],
      description:
        'Noor further along the rail, three-quarter profile, phone pressed to her ear, other hand gripping the rail. Scarf slipping, curls blowing in the wind. Shot from the player’s POV down the length of the rail, foreground railing out of focus. 50 mm.',
    },
    {
      id: 'c1_ferry_noor_turns',
      background: 'ferry_deck_dusk',
      camera: 'close',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'surprised', position: 'center', facing: 'camera' }],
      description:
        'Noor turning toward camera, caught off guard, eyebrows up, lips parted. Phone lowered against her chest. Dusk key light from screen right, sea out of focus behind. 85 mm, shallow depth of field.',
    },
    {
      id: 'c1_ferry_noor_laugh',
      background: 'ferry_deck_dusk',
      camera: 'close',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'laughing', position: 'center', facing: 'camera' }],
      description:
        'Noor laughing despite herself, head tipped back slightly, eyes creased. Same framing and light as c1_ferry_noor_turns, for continuity.',
    },
    {
      id: 'c1_ferry_noor_beside',
      background: 'ferry_deck_dusk',
      camera: 'medium',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'neutral', position: 'left', facing: 'right' }],
      description:
        'Two-shot from behind the player’s shoulder: Noor now beside them at the rail, forearms on the steel, looking at the water rather than at camera. Quiet, companionable. 35 mm.',
    },
    {
      id: 'c1_ferry_noor_flirty',
      background: 'ferry_deck_dusk',
      camera: 'close',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'flirty', position: 'center', facing: 'camera' }],
      description:
        'Noor studying the player with a sideways look, one eyebrow raised, half-smile. Island lights now bokeh in the background. Blue hour. 85 mm.',
    },
    {
      id: 'c1_ferry_noor_sad',
      background: 'ferry_deck_dusk',
      camera: 'close',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'sad', position: 'center', facing: 'left' }],
      description:
        'Noor looking away toward the island at the mention of Margit; the smile gone. Profile, wind in her hair, eyes glassy but not crying. Cooler grade than the previous shots.',
    },
    {
      id: 'c1_ferry_arrival',
      background: 'ferry_deck_dusk',
      camera: 'medium',
      characters: [{ id: 'noor', pose: 'leaning', expression: 'happy', position: 'right', facing: 'camera' }],
      description:
        'Noor pushing off the rail with a grin, gesturing over her shoulder at the harbour lights growing large behind her. Ferry horn moment, crew silhouettes at the bow. 35 mm.',
    },

    // --- Chapter 1 · The Harbour ---------------------------------------------
    {
      id: 'c1_harbour_sign',
      background: 'harbour_dusk',
      camera: 'medium',
      characters: [{ id: 'vera', pose: 'arms_crossed', expression: 'neutral', position: 'center', facing: 'camera' }],
      description:
        'Bottom of the ferry ramp. Vera in a charcoal coat holding a small, neatly hand-lettered sign with the player’s name. Hair pinned up, one strand loose in the wind. Harbour lamps behind her, wet cobbles reflecting. Slight low angle. 50 mm.',
    },
    {
      id: 'c1_harbour_vera_close',
      background: 'harbour_dusk',
      camera: 'close',
      characters: [{ id: 'vera', pose: 'arms_crossed', expression: 'neutral', position: 'center', facing: 'camera' }],
      description:
        'Vera, composed and unreadable, direct eye contact. Grey-blue eyes, faint scar through the left eyebrow visible. Soft lamp key from screen left, cold fill. 85 mm.',
    },
    {
      id: 'c1_harbour_vera_angry',
      background: 'harbour_dusk',
      camera: 'close',
      characters: [{ id: 'vera', pose: 'arms_crossed', expression: 'angry', position: 'center', facing: 'camera' }],
      description:
        'Same framing as c1_harbour_vera_close. A beat of silent anger: jaw set, a slow breath through the nose. Controlled, not theatrical.',
    },
    {
      id: 'c1_harbour_vera_flustered',
      background: 'harbour_dusk',
      camera: 'close',
      characters: [{ id: 'vera', pose: 'standing', expression: 'embarrassed', position: 'center', facing: 'left' }],
      description:
        'Vera thrown off balance for the first time: glance away, faint colour in her cheeks, hand going to the loose strand of hair. Same light as c1_harbour_vera_close.',
    },
    {
      id: 'c1_harbour_walk',
      background: 'harbour_dusk',
      camera: 'wide',
      characters: [{ id: 'vera', pose: 'standing', expression: 'neutral', position: 'center', facing: 'left' }],
      description:
        'From behind: Vera carrying the player’s bag up a steep cobbled street toward the hotel on the hill. The Halcyon’s lit windows at the top of frame. Long shadows from street lamps. 28 mm.',
    },
  ],
  'shot',
);
