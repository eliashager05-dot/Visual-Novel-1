import { P, S } from './helpers';

export const c1CorridorShots = [
  S('c1_corridor_empty', 'hotel_corridor_night', 'wide', [],
    'Long first-floor corridor: wine-red carpet, brass room numbers, sconces at half power, tall window at the far end full of black sea. Symmetrical, slightly eerie. 28 mm.'),
  S('c1_june_collision', 'hotel_corridor_night', 'medium', [P('june', 'surprised', { pose: 'wetsuit' })],
    'June mid-collision with camera: small, freckled, short copper hair dripping, black wetsuit, clutching a crate of glass sample jars, two jars in the air. Motion, water droplets frozen in sconce light. 35 mm.'),
  S('c1_june_squint', 'hotel_corridor_night', 'close', [P('june', 'neutral', { pose: 'wetsuit' })],
    'June looking the player up and down with scientific suspicion, head tilted, wet fringe stuck to forehead. 85 mm.'),
  S('c1_june_lights_up', 'hotel_corridor_night', 'close', [P('june', 'happy', { pose: 'wetsuit' })],
    'June lit up with enthusiasm, holding a sample jar up to the sconce so it glows faintly blue-green, eyes on the jar not the camera. 85 mm.'),
  S('c1_room12', 'player_room_night', 'wide', [],
    'Room 12: brass bed, writing desk under the window, faded heron wallpaper, an old cast-iron radiator, the sea and a lighthouse beam through the window. Moonlight and one bedside lamp. 24 mm.'),
];

export const c1DinnerShots = [
  S('c1_dining_wide', 'dining_room_night', 'wide', [P('vera', 'neutral', { position: 'left' }), P('june', 'neutral', { position: 'right', pose: 'notebook' })],
    'Huge empty dining room, one long table by a big fireplace set for six. Vera with papers, June reading a journal, and the empty head-of-table chair pulled out slightly, catching the firelight. 24 mm.'),
  S('c1_dinner_vera', 'dining_room_night', 'medium', [P('vera', 'neutral', { position: 'left', facing: 'right' })],
    'Vera seated beside the camera, sideways glance over her papers, the faintest suppressed smile. Firelight from the right. 50 mm.'),
  S('c1_dinner_vera_sad', 'dining_room_night', 'close', [P('vera', 'sad')],
    'Vera looking at the empty chair (the player in it), grief caught off guard, quickly controlled. 85 mm.'),
  S('c1_dinner_june', 'dining_room_night', 'medium', [P('june', 'neutral', { pose: 'notebook', position: 'right', facing: 'left' })],
    'June in an oversized jumper, damp hair, journal propped on the water jug, candle pushed aside. Firelight on freckles. 50 mm.'),
  S('c1_dinner_vera_papers', 'dining_room_night', 'medium', [P('vera', 'neutral', { pose: 'clipboard' })],
    'Vera squaring a stack of bank papers, reading glasses on, addressing the table like a board meeting. 50 mm.'),
  S('c1_dinner_noor', 'dining_room_night', 'medium', [P('noor', 'happy', { pose: 'bar', position: 'right' })],
    'Noor leaning in from the side door with a bar towel on her shoulder, tearing a hunk off the bread loaf, grinning; rain on her scarf. 35 mm.'),
];
