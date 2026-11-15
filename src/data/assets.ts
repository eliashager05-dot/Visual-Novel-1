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
    { id: 'low_tide_bar_closed', name: 'The Low Tide, after closing', placeholder: { palette: ['#0f0c14', '#3a2433', '#08060a'], motif: 'bar' } },
    { id: 'hotel_kitchen_night', name: 'Hotel kitchen', placeholder: { palette: ['#2e2a24', '#7d6a4c', '#17140f'], motif: 'interior' } },
    { id: 'hotel_corridor_night', name: 'First-floor corridor', placeholder: { palette: ['#241c18', '#5c4334', '#120d0a'], motif: 'interior' } },
    { id: 'dining_room_night', name: 'Dining room', placeholder: { palette: ['#2b1d16', '#9a6a43', '#160e0a'], motif: 'interior' } },
    { id: 'player_room_night', name: 'Room 12', placeholder: { palette: ['#141a26', '#3c4a63', '#0b0e15'], motif: 'room' } },
    { id: 'hotel_lobby_late', name: 'Lobby, after midnight', placeholder: { palette: ['#1d1612', '#5a3e2a', '#0e0a08'], motif: 'interior' } },
    { id: 'cove_night', name: 'The cove at night', placeholder: { palette: ['#05080f', '#123a4a', '#03050a'], motif: 'shore' } },
    { id: 'cove_low_tide_day', name: 'The cove at low tide', placeholder: { palette: ['#8fa6b5', '#c9b99a', '#4b4a3f'], motif: 'shore' } },
    { id: 'hotel_terrace_morning', name: 'Terrace, morning', placeholder: { palette: ['#9fb6c8', '#e6d3b0', '#5b5446'], motif: 'exterior' } },
    { id: 'island_road_day', name: 'The coast road', placeholder: { palette: ['#a8b8c4', '#d8c9a8', '#4e4a3c'], motif: 'exterior' } },
    { id: 'fish_factory_day', name: 'The old fish factory', placeholder: { palette: ['#7d8a93', '#b3a58a', '#3a3730'], motif: 'exterior' } },
    { id: 'hotel_exterior_storm', name: 'The Halcyon in the storm', placeholder: { palette: ['#05070b', '#1b2533', '#020305'], motif: 'storm' } },
    { id: 'boathouse_storm', name: 'Boathouse, storm', placeholder: { palette: ['#07090d', '#26303d', '#030405'], motif: 'storm' } },
    { id: 'lobby_candlelight', name: 'Lobby by candlelight', placeholder: { palette: ['#120c08', '#6e4524', '#080503'], motif: 'interior' } },
    { id: 'margit_room_night', name: "Margit's room", placeholder: { palette: ['#1a1410', '#584332', '#0c0907'], motif: 'room' } },
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
    {
      id: 'cg_noor_piano',
      title: 'After Hours',
      characters: ['noor'],
      placeholder: { palette: ['#0f0c14', '#c08a5a', '#08060a'], motif: 'bar' },
    },
    {
      id: 'cg_cove_glow',
      title: 'Bloom',
      characters: ['june'],
      placeholder: { palette: ['#03060c', '#1fd0c0', '#02040a'], motif: 'shore' },
    },
    {
      id: 'cg_vera_ledgers',
      title: 'Night Audit',
      characters: ['vera'],
      placeholder: { palette: ['#1d1612', '#d8a65e', '#0e0a08'], motif: 'interior' },
    },
    {
      id: 'cg_sienna_shed',
      title: 'Where She Started',
      characters: ['sienna'],
      placeholder: { palette: ['#7d8a93', '#d48aa6', '#3a3730'], motif: 'exterior' },
    },
    {
      id: 'cg_storm_boathouse',
      title: 'The Boat',
      characters: ['vera'],
      placeholder: { palette: ['#05070b', '#5a7088', '#020305'], motif: 'storm' },
    },
    {
      id: 'cg_margit_photo',
      title: 'Today',
      characters: [],
      placeholder: { palette: ['#0c1018', '#a7b4c8', '#05070b'], motif: 'water' },
    },
  ],
  'cg',
);

export const music = byId<AudioDefinition>(
  [
    { id: 'crossing', title: 'Crossing (ambient)' },
    { id: 'halcyon_theme', title: 'The Halcyon' },
    { id: 'old_rooms', title: 'Old Rooms (hotel interiors)' },
    { id: 'low_tide', title: 'Low Tide (bar)' },
    { id: 'sienna_theme', title: 'Clean Lines (Sienna)' },
    { id: 'night_piano', title: 'Receipts (Noor at the piano)' },
    { id: 'bloom', title: 'Bloom (the cove)' },
    { id: 'night_audit', title: 'Night Audit (Vera)' },
    { id: 'morning', title: 'Salt Morning' },
    { id: 'coast_road', title: 'Coast Road' },
    { id: 'storm', title: 'Storm' },
    { id: 'aftermath', title: 'Candles' },
    { id: 'mystery', title: 'Under the Tide' },
  ],
  'music',
);

export const sfx = byId<AudioDefinition>(
  [
    { id: 'ferry_horn', title: 'Ferry horn' },
    { id: 'phone_buzz', title: 'Phone vibrating' },
    { id: 'gull', title: 'Gulls' },
    { id: 'door_creak', title: 'Old door' },
    { id: 'glass_clink', title: 'Glasses' },
    { id: 'thunder', title: 'Thunder' },
    { id: 'rain_heavy', title: 'Heavy rain' },
    { id: 'power_down', title: 'Power failing' },
    { id: 'splash', title: 'Footsteps in water' },
    { id: 'piano_note', title: 'Single piano note' },
    { id: 'car_door', title: 'Car door' },
    { id: 'phone_message', title: 'Message tone' },
    { id: 'key_turn', title: 'Key in lock' },
  ],
  'sfx',
);
