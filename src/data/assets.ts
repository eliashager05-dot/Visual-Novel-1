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
    // Chapter Two
    { id: 'player_room_morning', name: 'Room 12, morning', placeholder: { palette: ['#8fa3b8', '#e2cfb0', '#4a4f5a'], motif: 'room' } },
    { id: 'hotel_lobby_morning', name: 'Lobby, the morning after', placeholder: { palette: ['#7d6a58', '#d6c2a0', '#3a2e24'], motif: 'interior' } },
    { id: 'east_wing_lido', name: 'The Halcyon Baths', placeholder: { palette: ['#5f7d7a', '#c9d6cf', '#26302f'], motif: 'interior' } },
    { id: 'hotel_roof_day', name: 'The roof', placeholder: { palette: ['#a9bccb', '#e8d9b8', '#4b4f55'], motif: 'exterior' } },
    { id: 'low_tide_bar_day', name: 'The Low Tide, flooded', placeholder: { palette: ['#3a3540', '#8c7a6a', '#17141a'], motif: 'bar' } },
    { id: 'causeway_day', name: 'The causeway', placeholder: { palette: ['#8d9fab', '#c4b598', '#3f4440'], motif: 'shore' } },
    { id: 'hotel_terrace_night', name: 'Terrace, night', placeholder: { palette: ['#0c1420', '#3a4a66', '#05080d'], motif: 'night' } },
    { id: 'sea_cave_night', name: 'The sea cave', placeholder: { palette: ['#03060a', '#1d4a52', '#020305'], motif: 'shore' } },
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
    // Chapter Two
    {
      id: 'cg_lido_vera',
      title: 'The Deep End',
      background: 'east_wing_lido',
      description:
        'Vera and the protagonist sitting side by side on the edge of the deep end of a drained 1920s swimming bath, legs hanging over the drop, seen from the far end of the empty pool. Green and white tiles, brass handrails, a broken glass roof letting a shaft of noon light fall across them; a thin mirror of rainwater on the pool floor below their feet. Her shoulder almost touching his.',
      characters: ['vera', 'player'],
      placeholder: { palette: ['#5f7d7a', '#e8e0c8', '#26302f'], motif: 'interior' },
    },
    {
      id: 'cg_neon_roof',
      title: 'The Missing C',
      background: 'hotel_roof_day',
      description:
        'Dusk on the hotel roof: Vera and the protagonist sitting on the parapet beside a huge old neon sign that has just lit up in full for the first time in years, reading THE HALCYON in warm pink-orange light. He has a screwdriver in his hand and grease on his cheek; she is laughing, looking at the sign, not at him. The sea and the first stars behind them.',
      characters: ['vera', 'player'],
      placeholder: { palette: ['#2b3048', '#f08a6a', '#151826'], motif: 'night' },
    },
    {
      id: 'cg_noor_song',
      title: 'March',
      background: 'low_tide_bar_day',
      description:
        'Noor on a beer crate in the half-flooded cellar bar, an acoustic guitar on her knee, wet floor reflecting daylight from the open street door above. Sleeves rolled, curls piled up, eyes closed as she sings. The protagonist sits on the stairs in the background, mop forgotten across his knees.',
      characters: ['noor', 'player'],
      placeholder: { palette: ['#3a3540', '#d9a066', '#17141a'], motif: 'bar' },
    },
    {
      id: 'cg_june_pipe',
      title: 'Slack Water',
      background: 'cove_low_tide_day',
      description:
        'Waist-deep in grey-green water at the old iron mooring at slack tide: June in a black drysuit leaning over a bronze pipe mouth in the rock, cupped hands in a plume of shimmering warm water, steam rising off the surface in the cold air; the protagonist beside her in chest waders holding the safety line, both looking down at the same thing. Overcast silver light.',
      characters: ['june', 'player'],
      placeholder: { palette: ['#8fa6b5', '#d8e6e0', '#4b4a3f'], motif: 'shore' },
    },
    {
      id: 'cg_sienna_holm',
      title: 'The Holm',
      background: 'causeway_day',
      description:
        'Sienna alone in the doorway of a roofless stone cottage on a tiny tidal islet, wind pulling at an enormous borrowed fisherman\'s jumper, one hand on the doorframe, the other closed around the thread bracelet on her wrist. Wet sand and seaweed between the islet and the broken causeway behind her. Grey sky, a break of sunlight on the sea.',
      characters: ['sienna'],
      placeholder: { palette: ['#8d9fab', '#e0d2b4', '#3f4440'], motif: 'shore' },
    },
    {
      id: 'cg_margit_lantern',
      title: 'Hello, Boy',
      background: 'sea_cave_night',
      description:
        'Inside a sea cave at night: a wiry 68-year-old woman in a yellow oilskin, hood pushed back, cropped iron-grey hair, holding a storm lantern up at head height, the light carving her weathered face. Behind her an old blue lobster boat, ELIN, moored to an iron ring, and a big green-painted pump with a bronze pipe; faint blue-green light glows in the water at her feet. She looks straight at the viewer, unsmiling, completely unsurprised.',
      characters: ['margit'],
      placeholder: { palette: ['#03060a', '#e3c25a', '#020305'], motif: 'shore' },
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
    { id: 'slack_water', title: 'Slack Water', brief: 'Chapter Two\'s night theme: the still moment when the tide turns. Suspended and hushed, a held low note, slow pulses like a distant engine, a few clear piano notes over the top; tension without movement. Loops.' },
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
