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
  S('c1_boathouse_run', 'boathouse_storm', 'wide', [P('vera', 'worried', { position: 'left', facing: 'right' }), P('player', 'worried', { position: 'right', facing: 'left' })],
    'Interior of a stone boathouse in a storm: sea water over the slipway, massive wooden doors swinging. Vera braces one door with her shoulder, the protagonist the other; a torch beam slices through the rain between them. 24 mm.'),
  S('c1_boathouse_find', 'boathouse_storm', 'medium', [P('vera', 'surprised', { position: 'left', facing: 'left' }), P('player', 'surprised', { position: 'right', facing: 'left' })],
    'Vera frozen, torch held out, its beam landing on something off-frame on the slipway; the protagonist a step behind her, following the beam. Rain dripping from their hair. 50 mm.'),
  S('c1_boathouse_figure', 'boathouse_storm', 'wide', [],
    'Far end of the boathouse: a figure in a dark oilskin, face hidden, caught for a split second in the torch beam at the side door. Motion blur. 35 mm.'),
  S('c1_storm_chase', 'hotel_exterior_storm', 'wide', [P('player', 'worried', { position: 'left', facing: 'right' })],
    'The cliff steps in the storm, rain turning them into a waterfall. The protagonist on one knee where he slipped, looking up; far above, a dark figure disappears into the night. Lit by lightning. 28 mm.'),
  S('c1_boathouse_vera_after', 'boathouse_storm', 'medium', [P('vera', 'angry', { pose: 'arms_crossed' })],
    'Vera soaked, arms crossed, glaring at the returning player from beside the boat, torch pointed at the floor. 50 mm.'),
  S('c1_storm_vera_close', 'boathouse_storm', 'extreme_close', [P('vera', 'embarrassed', { position: 'left', facing: 'right' }), P('player', 'worried', { position: 'right', facing: 'left' })],
    'Extreme close two-shot: Vera caught in the protagonist\'s arms, one hand fisted in his wet jacket, her face inches from his, eyes unguarded; his attention entirely on her. Torch light from below, rain behind. 100 mm.'),
  S('c1_storm_scarf', 'hotel_exterior_storm', 'close', [],
    'Insert: the protagonist\'s hand lifting a soaked orange scarf from a wet stone step, rain hammering it, lit by a lightning flash. 85 mm.'),
];

export const c1AftermathShots = [
  S('c1_candle_wide', 'lobby_candlelight', 'wide', [P('june', 'neutral', { pose: 'notebook', position: 'right' }), P('noor', 'neutral', { position: 'left' })],
    'The lobby lit by dozens of candles and a hurricane lamp: an elderly couple playing cards, June in a blanket on the stairs with crates, Noor at the bar door wringing out her hair. Rembrandt lighting. 24 mm.'),
  S('c1_sienna_arrives', 'lobby_candlelight', 'medium', [P('sienna', 'worried', { pose: 'coat' })],
    'Sienna thrown in through the front door by the storm: soaked camel coat, mascara running, heels in hand, the gale behind her. 35 mm.'),
  S('c1_noor_candle', 'lobby_candlelight', 'close', [P('noor', 'worried', { facing: 'left' })],
    'Noor alone at the top of the flooded bar steps, candle beside her, dark water reflecting it. Bare curls, no scarf. 85 mm.'),
  S('c1_june_stairs', 'lobby_candlelight', 'medium', [P('june', 'worried', { pose: 'notebook', position: 'left', facing: 'right' }), P('player', 'worried', { pose: 'seated', position: 'right', facing: 'left' })],
    'June on the stairs in a blanket with a laptop on her knees; the protagonist sitting on the step beside her, towel round his neck, both faces lit by a sharp spike on a temperature graph. 50 mm.'),
  S('c1_candle_player', 'lobby_candlelight', 'close', [P('player', 'worried')],
    'The protagonist by candlelight, towel round his neck, hair drying wild, one hand closed round something orange in his jacket pocket, watching someone across the lobby. 85 mm.'),
];

export const c1StormExtraShots = [
  S('c1_storm_steps', 'hotel_exterior_storm', 'medium', [P('vera', 'worried', { position: 'left', facing: 'right' }), P('player', 'neutral', { position: 'right', facing: 'left' })],
    'Vera and the protagonist climbing the storm-lashed cliff steps side by side, torch pointed down, both soaked; she turns her head to speak low, he leans in to hear. 35 mm.'),
  S('c1_sienna_blanket', 'lobby_candlelight', 'close', [P('sienna', 'worried')],
    'Sienna by the lobby fire wrapped in a coarse wool blanket, makeup gone, hair drying wild, the most unguarded she has looked. Firelight. 85 mm.'),
];
