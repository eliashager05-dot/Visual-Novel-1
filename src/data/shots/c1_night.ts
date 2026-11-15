import { P, S } from './helpers';

export const c1NightShots = [
  S('c1_room_window', 'player_room_night', 'wide', [],
    'Room 12 at midnight, lamp off: moonlight through the window, the cove far below, one tiny moving torch light on the waterline. The solicitor\'s envelope on the desk. 28 mm.'),
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
  S('c1_june_cove_rock', 'cove_night', 'medium', [P('june', 'sad', { pose: 'wetsuit', position: 'left', facing: 'right' })],
    'June sitting on a flat rock at the waterline, arms around her knees, looking at the rock beside her where Margit used to sit. Faint glow in the shallows. 50 mm.'),
  S('c1_letter_desk', 'player_room_night', 'close', [],
    'Insert: Margit\'s letter on the desk under the lamp — cream paper, forward-leaning fountain-pen script, a broken wax seal, and a small pale spiral shell beside it. 100 mm macro.'),
];
