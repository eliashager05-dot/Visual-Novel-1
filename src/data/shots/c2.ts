import { P, S } from './helpers';

/** Chapter Two, "Slack Water": day three. */

export const c2MorningShots = [
  S('c2_room_morning', 'player_room_morning', 'medium', [P('player', 'worried', { pose: 'seated' })],
    'Room 12 the morning after the storm: clean bright sun through the window, the sea glittering. The protagonist sitting on the rumpled bed still in yesterday\'s clothes and boots, looking down at the phone in his hands. 35 mm.'),
  S('c2_letter_morning', 'player_room_morning', 'close', [P('player', 'sad', { pose: 'seated' })],
    'The protagonist at the writing desk in morning light, a cream envelope with a broken red wax seal in front of him, a handwritten letter in one hand and a small pale spiral shell in the other palm. 85 mm.'),
  S('c2_lobby_morning', 'hotel_lobby_morning', 'wide', [],
    'The lobby the morning after the storm: leaves and broken glass on the chequered floor, the glass porch boarded up with a mismatched wooden door, every window open, buckets under drips, sunlight full of dust. 24 mm.'),
  S('c2_bram_sweeping', 'hotel_lobby_morning', 'medium', [P('bram', 'neutral')],
    'Bram sweeping broken glass into a dustpan with a huge broom, sleeves pushed up over his burn-scarred forearms, three buckets around his feet. Morning light from the open windows behind him. 50 mm.'),
  S('c2_vera_desk_morning', 'hotel_lobby_morning', 'medium', [P('vera', 'worried', { pose: 'clipboard' })],
    'Vera at the reception desk in yesterday\'s clothes, unslept, a pencil behind her ear, an old leather ledger open in front of her full of her own pencil notes, a dead telephone beside it. Strands escaping from her bun. 50 mm.'),
  S('c2_vera_photo', 'hotel_lobby_morning', 'close', [P('vera', 'sad', { facing: 'left' })],
    'Close on Vera looking down at a phone lying on the desk in front of her, not touching it, her face very still and her eyes wet. Soft morning light from the side. 85 mm.'),
  S('c2_breakfast_photo', 'hotel_lobby_morning', 'wide', [P('june', 'neutral', { position: 'left', facing: 'right' }), P('vera', 'sad', { position: 'center' }), P('bram', 'surprised', { position: 'right', facing: 'left' })],
    'Breakfast on two card tables pushed together in the lobby: toast, a teapot, a phone face up in the middle of the table. June leaning in to look at it, Vera turning away from the table, Bram frozen with a teapot in mid-air. 28 mm.'),
  S('c2_june_morning', 'hotel_lobby_morning', 'medium', [P('june', 'surprised', { pose: 'notebook' })],
    'June coming down the curling staircase two steps at a time with an open laptop balanced on one arm, talking, hair still damp, a pencil between her teeth. 35 mm.'),
  S('c2_sienna_morning', 'hotel_lobby_morning', 'medium', [P('sienna', 'embarrassed')],
    'Sienna at the foot of the stairs in an enormous navy fisherman\'s jumper that reaches her thighs, a silk blouse collar showing, oversized wellies, holding a cup of tea in both hands and looking faintly appalled at herself. 50 mm.'),
  S('c2_breakfast_wide', 'hotel_lobby_morning', 'wide', [P('bram', 'neutral', { position: 'farLeft' }), P('noor', 'laughing', { position: 'left' }), P('june', 'neutral', { position: 'center', pose: 'notebook' }), P('sienna', 'flirty', { position: 'right' }), P('vera', 'neutral', { position: 'farRight' })],
    'Breakfast in the storm-battered lobby: two card tables pushed together under the open windows, a heap of eggs, a brown teapot. Bram serving, Noor in green wellies with a bucket beside her chair, June with her laptop by her plate, Sienna in a huge borrowed jumper, Vera upright at the end. Morning light, dust in the air. 28 mm.'),
  S('c2_vera_keys', 'hotel_lobby_morning', 'close', [],
    'Insert: Vera\'s hand lifting a heavy old brass key labelled EAST WING from a hook in the key cabinet, the velvet rope and EAST WING CLOSED sign out of focus behind. 85 mm.'),
];

export const c2EastWingShots = [
  S('c2_rope', 'east_wing_lido', 'medium', [P('vera', 'neutral', { position: 'left', facing: 'right' }), P('player', 'neutral', { position: 'right', facing: 'left' })],
    'Vera unhooking a faded velvet rope across a dark corridor, the protagonist beside her with a torch; at the far end of the corridor, a bright doorway full of daylight. 35 mm.'),
  S('c2_lido_wide', 'east_wing_lido', 'wide', [P('vera', 'neutral', { position: 'left' }), P('player', 'surprised', { position: 'right', facing: 'left' })],
    'Reveal of the Halcyon Baths: a long drained 1926 swimming pool of green and white tiles under a vaulted glass roof with a storm hole in it, a diving board, brass rails, half-moon cubicle doors, a mirror of rainwater in the deep end. Two small figures at the shallow end. 18 mm, symmetrical.'),
  S('c2_lido_plaque', 'east_wing_lido', 'close', [],
    'Insert: a brass plaque green at the edges, screwed to the tiled wall by the pool steps, with engraved lettering, a shaft of light across it. The text is not legible in detail. 85 mm.'),
  S('c2_lido_footprints', 'east_wing_lido', 'wide', [],
    'Low angle across the dusty tiled floor of the shallow end: a worn path of small footprints through thick dust, leading from a side door to a square iron hatch in the floor. Shaft of light from the broken roof. 24 mm.'),
  S('c2_hatch_padlock', 'east_wing_lido', 'close', [],
    'Insert: a square iron floor hatch, rusted and old, held shut by a brand-new bright brass padlock with half a price sticker still on it. A faint wisp of warm vapour curling up from the gap at its edge. 100 mm macro feel.'),
  S('c2_cubicle', 'east_wing_lido', 'medium', [],
    'Inside an old changing cubicle with a half-moon door: a dry, neatly folded towel on a brass hook, and pinned to the back of the door a printed tide table with every night circled in red pencil, one date circled twice. A sharpened pencil on the bench. 35 mm.'),
  S('c2_ledger_licence', 'east_wing_lido', 'close', [],
    'Insert: the inside back cover of an old leather ledger, a note in small furious handwritten capitals in blue ink, unreadable in detail, a hand holding the cover open. Daylight from above. 85 mm.'),
  S('c2_vera_leaving_lido', 'east_wing_lido', 'medium', [P('vera', 'neutral', { pose: 'arms_crossed' })],
    'Vera at the pool edge with her arms crossed, composed again, the empty pool and the light from the broken roof behind her, a stray strand of hair across her face. 50 mm.'),
];

export const c2NoorShots = [
  S('c2_bar_flooded', 'low_tide_bar_day', 'wide', [],
    'The cellar bar flooded ankle-deep: beer mats floating, chairs stacked on tables, a hosepipe running up the stone stairs to the open street door where daylight pours in, reflected in the dark water. 24 mm.'),
  S('c2_noor_door', 'low_tide_bar_day', 'medium', [P('noor', 'angry', { facing: 'left' })],
    'Noor halfway up the stone stairs with a bucket, in green wellies, looking down over her shoulder with a hard, guarded face. Daylight from the street door behind her. 50 mm.'),
  S('c2_noor_bucket', 'low_tide_bar_day', 'medium', [P('noor', 'happy')],
    'Noor wading through the flooded bar in green wellies with a bucket in each hand, curls piled up on her head, laughing. Wet stone and reflected daylight around her. 35 mm.'),
  S('c2_bar_chain', 'low_tide_bar_day', 'medium', [P('noor', 'happy', { position: 'left', facing: 'right' }), P('player', 'neutral', { position: 'right', facing: 'left' })],
    'Noor and the protagonist passing a full bucket between them on the stone stairs, both soaked to the knee, falling into a rhythm; she is humming, eyes half closed. 35 mm.'),
  S('c2_noor_door_light', 'low_tide_bar_day', 'medium', [P('noor', 'worried', { pose: 'leaning' })],
    'Noor leaning in the open street door at the top of the stairs, mop propped beside her, looking up and across at the hotel above, a slice of late afternoon light across her face. 50 mm.'),
];

export const c2JuneShots = [
  S('c2_june_drysuit', 'cove_low_tide_day', 'medium', [P('june', 'happy', { pose: 'wetsuit' })],
    'June at the foot of the cliff path in a black drysuit with the hood pushed back, a coil of yellow safety line over one shoulder and a pair of chest waders held out toward the camera, grinning. Overcast light, fog over the water. 35 mm.'),
  S('c2_slack_wide', 'cove_low_tide_day', 'wide', [P('june', 'neutral', { pose: 'wetsuit', position: 'left' }), P('player', 'neutral', { position: 'right' })],
    'The cove at slack water: the sea perfectly flat and grey out to the rusted iron ring of the old mooring; two figures waist-deep wading toward it; light fog, silver light. 24 mm.'),
  S('c2_pipe_mouth', 'cove_low_tide_day', 'close', [P('june', 'laughing', { pose: 'wetsuit' })],
    'June surfacing next to the mooring, hair plastered flat, water streaming off her face, laughing; in the water by her hands a faint glittering shimmer and steam rising off the surface. 85 mm.'),
  S('c2_june_blanket', 'cove_low_tide_day', 'medium', [P('june', 'worried', { position: 'left', facing: 'camera' }), P('player', 'neutral', { position: 'right', facing: 'left' })],
    'June and the protagonist on the beach wrapped together in one crinkled silver foil blanket, both dripping, June looking up past the camera at the cliff and the dark windows of the hotel above. 35 mm.'),
];

export const c2SiennaShots = [
  S('c2_causeway_wide', 'causeway_day', 'wide', [P('sienna', 'neutral', { position: 'right' })],
    'A narrow stone causeway across a tidal inlet, ten metres of it washed away by the storm with sea sliding through the gap; a dark rental car nose-down in the ditch; a small figure in a big jumper sitting on a bollard beside it. Blustery sky. 24 mm.'),
  S('c2_sienna_bollard', 'causeway_day', 'medium', [P('sienna', 'flirty')],
    'Sienna sitting on an iron bollard in an enormous navy fisherman\'s jumper and green wellies three sizes too big, sleek black bob blown sideways, one eyebrow raised at the viewer. 50 mm.'),
  S('c2_car_push', 'causeway_day', 'medium', [P('player', 'worried', { facing: 'left' }), P('sienna', 'laughing', { position: 'left', facing: 'right' })],
    'The protagonist straining against the back of a car stuck in a ditch, his jeans sprayed with seaweed and mud from a spinning wheel; Sienna leaning out of the driver\'s window laughing. 35 mm.'),
  S('c2_holm_walk', 'causeway_day', 'wide', [P('sienna', 'neutral', { position: 'left', facing: 'left' })],
    'Low tide: wet sand where the causeway broke, and Sienna walking across it alone toward a tiny grassy islet with a roofless stone cottage, wind pulling at her jumper. Patches of sun moving across the sand. 28 mm.'),
  S('c2_sienna_satphone', 'causeway_day', 'close', [P('sienna', 'worried')],
    'Sienna reading a chunky satellite phone, the screen lighting her face, her expression closing up. Wind in her hair, the sea behind. 85 mm.'),
];

export const c2VeraRoofShots = [
  S('c2_roof_tarps', 'hotel_roof_day', 'wide', [P('vera', 'neutral', { position: 'left', facing: 'right' }), P('player', 'worried', { position: 'right', facing: 'left' })],
    'The hotel roof: Vera and the protagonist hauling a big blue tarpaulin over a skylight in the wind, buckets everywhere, chimney stacks, the sea beyond. Vera clearly in charge. 24 mm.'),
  S('c2_roof_break', 'hotel_roof_day', 'medium', [P('vera', 'neutral', { pose: 'standing', position: 'left', facing: 'right' }), P('player', 'happy', { pose: 'seated', position: 'right', facing: 'left' })],
    'Vera and the protagonist sitting on two upturned buckets behind a chimney stack out of the wind, sharing a battered flask of tea, tarpaulin and the sea behind them, warm afternoon light. She is mid-question, looking straight at him. 50 mm.'),
  S('c2_roof_sign', 'hotel_roof_day', 'wide', [],
    'The back of a huge 1950s neon sign on an iron frame at the edge of the roof, letters a metre high wound with glass tubing reading THE HAL YON from behind, the C clearly dark and dead; the sea and sky beyond. 24 mm.'),
  S('c2_roof_cove', 'hotel_roof_day', 'medium', [P('vera', 'worried', { facing: 'left' })],
    'Vera at the parapet in golden late light, looking down over the edge at something far below, one hand gripping the stone, wind in the loose strands of her hair. 50 mm.'),
];

export const c2EveningShots = [
  S('c2_lobby_dusk', 'hotel_lobby_morning', 'wide', [],
    'The lobby at dusk, swept and quiet again: windows shut, the fire lit low, the first lamp switched on, blue evening outside the boarded porch. 24 mm.'),
  S('c2_dinner_wide', 'hotel_lobby_evening', 'wide', [P('noor', 'laughing', { position: 'farLeft' }), P('june', 'neutral', { position: 'left' }), P('vera', 'worried', { position: 'center' }), P('sienna', 'neutral', { position: 'right' }), P('bram', 'neutral', { position: 'farRight' })],
    'Dinner by the lobby fire: two card tables, six mismatched chairs, bowls of fish stew, candles. Noor mid-story with her spoon, June eating hungrily, Vera upright and not eating, Sienna in a borrowed jumper, Bram standing with the pot and glancing at the clock. Firelight. 28 mm.'),
  S('c2_kitchen_bram', 'hotel_kitchen_night', 'wide', [P('bram', 'neutral', { facing: 'left' })],
    'The big kitchen in the evening: steam, copper pans, Bram at the range with his back half turned, six steel-covered plates lined up on the pass, and by the back door a wicker basket with a seventh plate in it. 28 mm.'),
  S('c2_basket', 'hotel_kitchen_night', 'close', [],
    'Insert: a wicker basket by a back door holding a steel-covered plate, a dented thermos, a paper bag and a small tin of cherry pipe tobacco with a sailing ship on the lid. Warm kitchen light. 85 mm.'),
  S('c2_bram_close', 'hotel_kitchen_night', 'close', [P('bram', 'sad', { facing: 'left' })],
    'Close on Bram wiping the rim of a plate with a cloth, slowly, eyes down, steam drifting across his face. 85 mm.'),
  S('c2_hatch_night', 'east_wing_lido', 'wide', [P('bram', 'neutral')],
    'Night in the drained baths: Bram kneeling at an open floor hatch with a torch beside him; warm lantern light coming up out of the floor; a hand in a yellow oilskin sleeve reaching up out of the hole to take a wicker basket from him. Seen from a dark doorway. 35 mm.'),
  S('c2_room_night_phone', 'player_room_night', 'medium', [P('player', 'worried', { pose: 'seated' })],
    'Room 12 at night: the protagonist sitting on the end of the bed fully dressed, boots on, a torch beside him, lit by the screen of the phone in his hand. 50 mm.'),
  S('c2_vera_door', 'hotel_corridor_night', 'medium', [P('vera', 'neutral')],
    'Vera opening her bedroom door in the dim corridor, fully dressed in a navy waterproof jacket, a torch already in her hand, as if she had been waiting. 50 mm.'),
];

export const c2LateShots = [
  S('c2_terrace_vera', 'hotel_terrace_night', 'medium', [P('vera', 'worried', { pose: 'clipboard' })],
    'Vera at a wrought-iron table on the cliff terrace at night, in a coat, doing accounts by the light of a reception lamp on a long cable, a cup of tea beside the ledger, the dark sea and moonlight behind her. 50 mm.'),
  S('c2_bar_piano_night', 'low_tide_bar_closed', 'medium', [P('noor', 'laughing', { pose: 'guitar' })],
    'Noor at the battered upright piano in the dark bar, fairy lights and one lamp, banging out a chord with exaggerated force and a grin, curls loose, the floor still damp and reflecting the lights. 35 mm.'),
  S('c2_june_room', 'player_room_night', 'wide', [P('june', 'neutral', { pose: 'notebook' })],
    'A small hotel guest room turned laboratory: every wall covered in printed graphs held up with tape, sample jars on the radiator, a wetsuit hanging from the wardrobe door, June cross-legged on the bed with a laptop. Lamp light. 24 mm.'),
  S('c2_june_graph', 'player_room_night', 'close', [P('june', 'worried')],
    'Close on June\'s face lit by her laptop screen, eyes fixed on a line graph that has just jumped upward, one hand pressed to her mouth. 85 mm.'),
  S('c2_lounge_sienna', 'hotel_lobby_late', 'medium', [P('sienna', 'flirty', { pose: 'leaning' })],
    'Sienna curled on a velvet sofa in the dark lounge by the fire, feet tucked under an enormous borrowed jumper, a bottle of red wine on the floor and a tooth mug in her hand, raising it toward the viewer. Firelight only. 50 mm.'),
];

export const c2SlackWaterShots = [
  S('c2_cove_path_night', 'cove_night', 'wide', [P('player', 'worried', { facing: 'left' })],
    'The steep cliff path at night in thick low fog, one torch beam cutting a cone through it; below, the tide far out and the old iron mooring standing on bare sand, faint blue-green glow in the water around its foot. 24 mm.'),
  S('c2_cave_mouth', 'cove_night', 'wide', [],
    'At the foot of the cliff, under the dark hotel, a tall black mouth in the rock exposed by the low tide, warm lantern light moving deep inside; fog, wet sand, glowing water. 28 mm.'),
  S('c2_cave_elin', 'sea_cave_night', 'wide', [],
    'Inside a sea cave: the old blue lobster boat ELIN moored to an iron ring on the last of the water, and behind it a huge green-painted 1920s pump with a bronze pipe running into the rock; one storm lantern, wet black walls, faint glow in the water. 24 mm.'),
  S('c2_cave_camp', 'sea_cave_night', 'medium', [],
    'A hidden camp on a rock ledge in the cave: a camp bed with a wool blanket, a primus stove, a crate used as a table with a steel plate cover, a thermos and a pipe on a saucer still trailing smoke, lit by a lantern. 35 mm.'),
  S('c2_margit_reveal', 'sea_cave_night', 'medium', [P('margit', 'neutral')],
    'Margit stepping out from behind the pump in a yellow oilskin with the hood still up, holding a storm lantern high so it lights the underside of the hood; her face mostly in shadow. 50 mm.'),
  S('c2_margit_tea', 'sea_cave_night', 'medium', [P('margit', 'neutral', { position: 'left', facing: 'right' }), P('player', 'worried', { pose: 'seated', position: 'right', facing: 'left' })],
    'Margit, hood down, sitting on a crate in the lantern light pouring tea from a thermos into two tin mugs; the protagonist on the edge of the camp bed opposite, still in his jacket, watching her. The pump and the boat dark behind them. 35 mm.'),
  S('c2_vera_margit', 'sea_cave_night', 'medium', [P('vera', 'sad', { position: 'left', facing: 'right' }), P('margit', 'sad', { position: 'right', facing: 'left' })],
    'Vera and Margit face to face in the lantern light inside the cave, a metre apart: Vera with tears on her face and her fists clenched, Margit in her yellow oilskin, hood down, standing very still and letting her look. 50 mm.'),
];
