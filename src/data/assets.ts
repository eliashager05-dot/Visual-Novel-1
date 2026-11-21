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
      background: 'ferry_deck_dusk',
      description:
        'Wide cinematic view from behind: Noor and the protagonist side by side at the ferry rail, and ahead of them the island rising out of the haze, a dark hump of rock with a lighthouse and a scatter of lit windows climbing a hill. Blue hour, last orange light on the water.',
      characters: ['noor', 'player'],
      placeholder: { palette: ['#2b3a55', '#e8a87c', '#1c2a3a'], motif: 'water' },
    },
    {
      id: 'cg_noor_piano',
      title: 'After Hours',
      background: 'low_tide_bar_closed',
      description:
        'Noor at the battered upright piano in the closed bar, lit by one lamp and strings of fairy lights, seen in three-quarter view from behind, hands on the keys, curls loose. Her face is visible in the mirror behind the bar, and so is the protagonist standing in the doorway.',
      characters: ['noor', 'player'],
      placeholder: { palette: ['#0f0c14', '#c08a5a', '#08060a'], motif: 'bar' },
    },
    {
      id: 'cg_cove_glow',
      title: 'Bloom',
      background: 'cove_night',
      description:
        'June knee-deep in black sea water at night, trailing one hand through it. Blue-green bioluminescence blazes around her fingers and legs and lights her delighted face from below. Stars overhead; glowing footprints in the shallows in the foreground.',
      characters: ['june'],
      placeholder: { palette: ['#03060c', '#1fd0c0', '#02040a'], motif: 'shore' },
    },
    {
      id: 'cg_vera_ledgers',
      title: 'Night Audit',
      background: 'hotel_lobby_late',
      description:
        "Vera and the protagonist side by side behind the hotel reception desk in the middle of the night, under a single green banker's lamp, ledgers open in front of them. She is reaching past him for a pencil; neither is looking at the other.",
      characters: ['vera', 'player'],
      placeholder: { palette: ['#1d1612', '#d8a65e', '#0e0a08'], motif: 'interior' },
    },
    {
      id: 'cg_sienna_shed',
      title: 'Where She Started',
      background: 'fish_factory_day',
      description:
        'Sienna standing in front of a small boat shed with a faded blue door, half turned away, thumb on the thread bracelet at her wrist. The derelict fish factory and a grey sea behind; the protagonist a few steps back, watching her. Flat overcast light.',
      characters: ['sienna', 'player'],
      placeholder: { palette: ['#7d8a93', '#d48aa6', '#3a3730'], motif: 'exterior' },
    },
    {
      id: 'cg_storm_boathouse',
      title: 'The Boat',
      background: 'boathouse_storm',
      description:
        'A torch beam cutting through rain inside a flooded stone boathouse, landing on an old blue-hulled wooden lobster boat on the slipway. Vera in the foreground with her back to camera, frozen, soaked. Lightning through the open sea doors.',
      characters: ['vera'],
      placeholder: { palette: ['#05070b', '#5a7088', '#020305'], motif: 'storm' },
    },
    {
      id: 'cg_margit_photo',
      title: 'Today',
      background: 'ferry_deck_dusk',
      description:
        'A phone-camera photograph, slightly tilted: a wiry 68-year-old woman in a yellow oilskin on a ferry deck in grey early-morning light, cropped iron-grey hair blowing, sharp blue eyes looking straight into the camera. Behind her, a white passenger-lounge wall with a digital clock.',
      characters: [],
      placeholder: { palette: ['#0c1018', '#a7b4c8', '#05070b'], motif: 'water' },
    },
  ],
  'cg',
);

export const music = byId<AudioDefinition>(
  [
    { id: 'crossing', title: 'Crossing (ambient)', brief: 'Opening ambience at sea: slow, wide, a little melancholy. Soft synth pad or strings over distant waves; no drums. Loops seamlessly, 2–3 min.' },
    { id: 'halcyon_theme', title: 'The Halcyon', brief: 'Main theme and title screen: warm, wistful piano with light strings, a hint of mystery. Moderate tempo. Loops, 2–3 min.' },
    { id: 'old_rooms', title: 'Old Rooms (hotel interiors)', brief: 'Hotel interiors: gentle, slightly old-fashioned. Solo piano or a small string trio, like a 1920s hotel remembering itself. Loops.' },
    { id: 'low_tide', title: 'Low Tide (bar)', brief: 'The bar: relaxed, warm and lived-in. Soft acoustic guitar, upright bass, brushed drums; low enough to talk over. Loops.' },
    { id: 'sienna_theme', title: 'Clean Lines (Sienna)', brief: 'Sienna: sleek and confident with an undertow of sadness. Muted electric piano, a slow groove, minor key. Loops.' },
    { id: 'night_piano', title: 'Receipts (Noor at the piano)', brief: 'Noor at the piano after hours: a solo piano sketch, unfinished-sounding, intimate, the same short phrase returning with small changes. Loops.' },
    { id: 'bloom', title: 'Bloom (the cove)', brief: 'The glowing cove: magical and hushed. Shimmering pads, celesta or glass harmonica, slow; the feeling of seeing something impossible. Loops.' },
    { id: 'night_audit', title: 'Night Audit (Vera)', brief: 'Vera at the desk at night: quiet, steady, a ticking clock feel; sparse piano and soft strings, tired but tender. Loops.' },
    { id: 'morning', title: 'Salt Morning', brief: 'Morning on the terrace: bright, fresh, hopeful. Acoustic guitar or piano, light percussion, sea air. Loops.' },
    { id: 'coast_road', title: 'Coast Road', brief: 'Driving the island road: forward motion, open landscape, a touch of tension underneath. Guitar and strings, mid tempo. Loops.' },
    { id: 'storm', title: 'Storm', brief: 'The storm: dark, driving, urgent. Low strings, timpani rolls, pulsing synth; builds without resolving. Loops.' },
    { id: 'aftermath', title: 'Candles', brief: 'Candlelit lobby after the storm: exhausted calm, warm but uneasy. Solo cello or piano, very slow. Loops.' },
    { id: 'mystery', title: 'Under the Tide', brief: 'Discoveries and secrets: quiet suspense. Low drones, sparse plucked notes, a music-box hint. Loops.' },
  ],
  'music',
);

export const sfx = byId<AudioDefinition>(
  [
    { id: 'ferry_horn', title: 'Ferry horn', brief: 'Deep ship horn, one long blast, 2–3 s, with a little harbour echo.' },
    { id: 'phone_buzz', title: 'Phone vibrating', brief: 'A phone vibrating on a hard surface, two short buzzes.' },
    { id: 'gull', title: 'Gulls', brief: 'Two or three gull calls over waves.' },
    { id: 'door_creak', title: 'Old door', brief: 'An old wooden door creaking open slowly.' },
    { id: 'glass_clink', title: 'Glasses', brief: 'Two glasses clinking at a bar.' },
    { id: 'thunder', title: 'Thunder', brief: 'A close thunderclap with a long rolling tail, 4–6 s.' },
    { id: 'rain_heavy', title: 'Heavy rain', brief: 'Heavy rain on windows and stone, 4–6 s, can fade in and out.' },
    { id: 'power_down', title: 'Power failing', brief: 'Electrics failing: a hum dropping away, a click, silence.' },
    { id: 'splash', title: 'Footsteps in water', brief: 'Wet footsteps running in shallow water.' },
    { id: 'piano_note', title: 'Single piano note', brief: 'One soft low piano note, left to ring.' },
    { id: 'car_door', title: 'Car door', brief: 'A car door closing solidly.' },
    { id: 'phone_message', title: 'Message tone', brief: 'A short, gentle two-note message tone.' },
    { id: 'key_turn', title: 'Key in lock', brief: 'An old iron key turning in a lock, a heavy click.' },
  ],
  'sfx',
);
