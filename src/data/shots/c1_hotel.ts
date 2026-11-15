import { P, S } from './helpers';

export const c1HotelShots = [
  S('c1_hotel_facade', 'hotel_exterior_night', 'wide', [],
    'The Halcyon from the bottom of its front steps at night: four storeys of weathered white stone, glass porch glowing warm, neon sign "THE HAL YON" with the C dark. Wet cobbles, sea mist. 24 mm, low angle.'),
  S('c1_hotel_vera_door', 'hotel_exterior_night', 'medium', [P('vera', 'neutral', { pose: 'standing', position: 'right', facing: 'left' })],
    'Vera at the brass front door, carrying the player\'s bag, glancing up at the dead letter with deadpan resignation. Warm porch light on her face, cold night behind. 50 mm.'),
  S('c1_lobby_wide', 'hotel_lobby_evening', 'wide', [P('vera', 'neutral', { position: 'left' })],
    '1920s lobby: chequered tiles, curling staircase into shadow, worn velvet armchairs, brass pigeonholes behind reception. Vera crossing frame like a tour guide. A velvet rope across a dark corridor in the background, sign "EAST WING CLOSED". 28 mm.'),
  S('c1_lobby_vera_close', 'hotel_lobby_evening', 'close', [P('vera', 'neutral')],
    'Vera answering too quickly; eyes flick toward the roped-off corridor and back. Lamp light, shallow depth of field. 85 mm.'),
  S('c1_kitchen_bram', 'hotel_kitchen_night', 'medium', [P('bram', 'neutral', { position: 'right', facing: 'left' })],
    'Big old hotel kitchen: copper pans, huge range, steam. Bram, broad and grey-bearded, apron over a fisherman\'s jumper, stirring a pot and looking the player over. Warm tungsten light. 35 mm.'),
  S('c1_kitchen_bram_close', 'hotel_kitchen_night', 'close', [P('bram', 'sad')],
    'Bram leaning on the table across from camera, forearms with old burn scars, quiet and sad. Steam drifting through frame. 85 mm.'),
  S('c1_kitchen_vera_bram', 'hotel_kitchen_night', 'medium', [P('vera', 'angry', { position: 'left', facing: 'right' }), P('bram', 'neutral', { position: 'right', facing: 'left' })],
    'Two-shot: Vera in the kitchen doorway, arms crossed, warning look; Bram at the stove refusing to be warned. 35 mm.'),
  S('c1_kitchen_key', 'hotel_kitchen_night', 'close', [P('vera', 'neutral', { position: 'center' })],
    'Insert/close: Vera\'s hand setting a heavy brass key with a wooden "12" fob on the scrubbed table, her face soft-focus above it. 100 mm macro feel.'),
];
