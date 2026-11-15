import { P, S } from './helpers';

export const c1StormShots = [
  S('c1_storm_facade', 'hotel_exterior_storm', 'wide', [],
    'The Halcyon in a full gale at night: sideways rain, the sea exploding white against the cliff below, every ground-floor window lit, the neon sign flickering. 24 mm, slightly Dutch angle.'),
  S('c1_storm_lobby', 'hotel_lobby_evening', 'medium', [P('vera', 'worried', { position: 'left' }), P('bram', 'neutral', { position: 'right', facing: 'left' })],
    'Lobby during the storm: Vera at reception on an old phone, Bram taping X shapes across the porch glass, rain hammering outside. 35 mm.'),
  S('c1_storm_dark', 'lobby_candlelight', 'wide', [],
    'Total blackout: the lobby in near darkness, only lightning through the porch glass picking out the staircase and the clock. 24 mm.'),
  S('c1_storm_bram_match', 'lobby_candlelight', 'close', [P('bram', 'worried')],
    'Bram\'s face lit from below by a single struck match cupped in his scarred hands. 85 mm.'),
  S('c1_boathouse_run', 'boathouse_storm', 'wide', [P('vera', 'worried', { position: 'center', facing: 'left' })],
    'Interior of a stone boathouse in a storm: sea water over the slipway, massive wooden doors swinging, Vera bracing one door with her shoulder, torch beam slicing through rain. 24 mm.'),
  S('c1_boathouse_find', 'boathouse_storm', 'medium', [P('vera', 'surprised', { facing: 'left' })],
    'Vera frozen, torch held out, its beam landing on something off-frame on the slipway. Rain dripping from her hair. 50 mm.'),
  S('c1_boathouse_figure', 'boathouse_storm', 'wide', [],
    'Far end of the boathouse: a figure in a dark oilskin, face hidden, caught for a split second in the torch beam at the side door. Motion blur. 35 mm.'),
  S('c1_storm_chase', 'hotel_exterior_storm', 'wide', [],
    'The cliff steps in the storm, rain turning them into a waterfall, a dark figure far above disappearing into the night. Torchless, lit by lightning. 28 mm.'),
  S('c1_boathouse_vera_after', 'boathouse_storm', 'medium', [P('vera', 'angry', { pose: 'arms_crossed' })],
    'Vera soaked, arms crossed, glaring at the returning player from beside the boat, torch pointed at the floor. 50 mm.'),
  S('c1_storm_vera_close', 'boathouse_storm', 'extreme_close', [P('vera', 'embarrassed', { facing: 'left' })],
    'Extreme close-up: Vera caught in the player\'s arms, wet hair against her cheek, eyes very close and unguarded. Torch light from below, rain behind. 100 mm.'),
];

export const c1AftermathShots = [
  S('c1_candle_wide', 'lobby_candlelight', 'wide', [P('june', 'neutral', { pose: 'notebook', position: 'right' }), P('noor', 'neutral', { position: 'left' })],
    'The lobby lit by dozens of candles and a hurricane lamp: an elderly couple playing cards, June in a blanket on the stairs with crates, Noor at the bar door wringing out her hair. Rembrandt lighting. 24 mm.'),
  S('c1_sienna_arrives', 'lobby_candlelight', 'medium', [P('sienna', 'worried', { pose: 'coat' })],
    'Sienna thrown in through the front door by the storm: soaked camel coat, mascara running, heels in hand, the gale behind her. 35 mm.'),
  S('c1_noor_candle', 'lobby_candlelight', 'close', [P('noor', 'worried', { facing: 'left' })],
    'Noor alone at the top of the flooded bar steps, candle beside her, dark water reflecting it. Bare curls, no scarf. 85 mm.'),
  S('c1_june_stairs', 'lobby_candlelight', 'medium', [P('june', 'worried', { pose: 'notebook' })],
    'June on the stairs in a blanket, laptop on her knees, screen light on her face showing a sharp spike on a temperature graph. 50 mm.'),
];

export const c1StormExtraShots = [
  S('c1_storm_steps', 'hotel_exterior_storm', 'medium', [P('vera', 'worried', { position: 'left', facing: 'right' })],
    'Vera climbing the storm-lashed cliff steps beside the player, torch pointed down, hair soaked flat, turning her head to speak low. 35 mm.'),
  S('c1_sienna_blanket', 'lobby_candlelight', 'close', [P('sienna', 'worried')],
    'Sienna by the lobby fire wrapped in a coarse wool blanket, makeup gone, hair drying wild, the most unguarded she has looked. Firelight. 85 mm.'),
];
