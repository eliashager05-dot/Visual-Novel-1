import { byId } from '@/engine/content';
import type { AudioDefinition, BackgroundDefinition, CgDefinition } from '@/types';

/**
 * Asset manifest. `src` is optional: without it the renderer paints a
 * procedural placeholder from `placeholder`. To integrate final renders, drop
 * the file into /public/assets/... and set `src` — no story edits required.
 */

export const backgrounds = byId<BackgroundDefinition>(
  [
    { id: 'ferry_deck_dusk', name: 'Ferry deck, dusk', placeholder: { palette: ['#2b3a55', '#c97b63', '#1c2a3a'], motif: 'water' } },
    { id: 'harbour_dusk', name: 'Halcyon Point harbour', placeholder: { palette: ['#34405e', '#d9a066', '#20262e'], motif: 'exterior' } },
    { id: 'hotel_exterior_night', name: 'The Halcyon, exterior', placeholder: { palette: ['#0d1424', '#2c3b5c', '#11161f'], motif: 'night' } },
    { id: 'hotel_lobby_evening', name: 'Lobby', placeholder: { palette: ['#3b2a22', '#8a5a3c', '#1d1410'], motif: 'interior' } },
    { id: 'low_tide_bar_night', name: 'The Low Tide bar', placeholder: { palette: ['#1f1420', '#6b3b4a', '#120b12'], motif: 'bar' } },
  ],
  'background',
);

export const cgs = byId<CgDefinition>(
  [
    {
      id: 'cg_ferry_noor',
      title: 'Crossing',
      characters: ['noor'],
      placeholder: { palette: ['#2b3a55', '#e8a87c', '#1c2a3a'], motif: 'water' },
    },
  ],
  'cg',
);

export const music = byId<AudioDefinition>(
  [
    { id: 'crossing', title: 'Crossing (ambient)' },
    { id: 'halcyon_theme', title: 'The Halcyon' },
  ],
  'music',
);

export const sfx = byId<AudioDefinition>(
  [
    { id: 'ferry_horn', title: 'Ferry horn' },
    { id: 'phone_buzz', title: 'Phone vibrating' },
    { id: 'gull', title: 'Gulls' },
  ],
  'sfx',
);
