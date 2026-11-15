import { P, S } from './helpers';

export const c1NightShots = [
  S('c1_room_window', 'player_room_night', 'wide', [P('player', 'neutral', { position: 'right', facing: 'left' })],
    'Room 12 at midnight, lamp off: the protagonist standing at the window in moonlight, seen from behind and to one side, looking down at the cove where one tiny torch light moves along the waterline. The solicitor\'s envelope on the desk beside him. 28 mm.'),
  S('c1_vera_desk_wide', 'hotel_lobby_late', 'wide', [P('vera', 'neutral', { pose: 'clipboard' })],
    'Dark lobby, single green banker\'s lamp at reception. Vera behind the desk in a grey cardigan, hair half down, reading glasses, surrounded by ledgers. Clock above the pigeonholes. 28 mm.'),
  S('c1_vera_desk_close', 'hotel_lobby_late', 'close', [P('vera', 'neutral')],
    'Vera in lamplight, glasses just removed and held in one hand, tired eyes, a loose strand of hair. Intimate, quiet. 85 mm.'),
  S('c1_noor_piano_back', 'low_tide_bar_closed', 'medium', [P('noor', 'neutral', { position: 'right', facing: 'left' })],
    'The closed bar: chairs on tables, fairy lights, one lamp on the upright piano. Noor seen from behind and slightly to the side at the keys, scarf off, curls loose. Her face reflected in the bar mirror. 35 mm.'),
  S('c1_noor_piano_close', 'low_tide_bar_closed', 'close', [P('noor', 'neutral', { facing: 'left' })],
    'Noor at the piano, three-quarter profile, lamp-lit, ink on her fingers, guarded and open at once. 85 mm.'),
  S('c1_cove_night_wide', 'cove_night', 'wide', [P('june', 'neutral', { pose: 'wetsuit', position: 'right' })],
    'Small cove at night from the bottom of the cliff path: black water, pale sand, rocks, a single head torch where June stands knee-deep with sample jars. Stars. 24 mm.'),
  S('c1_june_cove_close', 'cove_night', 'close', [P('june', 'happy', { pose: 'wetsuit' })],
    'June in the water lit from below by faint blue-green bioluminescence and the head torch, beckoning, grinning. 85 mm.'),
  S('c1_june_cove_rock', 'cove_night', 'medium', [P('june', 'sad', { pose: 'wetsuit', position: 'left', facing: 'right' }), P('player', 'neutral', { position: 'right', facing: 'left' })],
    'June sitting on a flat rock at the waterline, arms round her knees, looking at the empty rock beside her where Margit used to sit; the protagonist standing in the shallows nearby, jeans rolled, faint blue-green glow round his ankles. 50 mm.'),
  S('c1_letter_desk', 'player_room_night', 'close', [],
    'Insert: Margit\'s letter on the desk under the lamp — cream paper, forward-leaning fountain-pen script, a broken wax seal, and a small pale spiral shell beside it. 100 mm macro.'),
  S('c1_letter_player', 'player_room_night', 'close', [P('player', 'sad', { pose: 'seated' })],
    'The protagonist at the desk holding a small pale shell to his ear, eyes closed, lamp light on one side of his face, the letter open in front of him. 85 mm.'),
];
