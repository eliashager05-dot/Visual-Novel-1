import type { LocationBrief, RenderSheet, SetBrief } from '@/types';

/**
 * Production data for building the game's art in 3D. Single source of truth
 * for `npm run brief`, which writes docs/CHARACTER_SHEETS.md and the location
 * and production-order sections of docs/RENDER_BRIEF.md.
 *
 * Every character is an adult (21+) and must read clearly as one.
 */

export const renderSheets: RenderSheet[] = [
  {
    character: 'player',
    heightCm: 181,
    build: 'Tall and lean, slightly underfed, good shoulders he does not use: he slouches, hands in pockets. Not a gym body.',
    face: 'Long face, straight strong nose with a slight bump, defined jaw under two days of dark stubble, heavy-lidded eyes, a mouth that rests in a dry half-smile.',
    skin: 'Light olive, pale from years indoors, visible tired shadows under the eyes. A few faint acne scars on the left cheek in close-ups.',
    eyes: 'Hazel-green, heavy-lidded, attentive. He looks at mouths and hands when people talk: he is listening.',
    hair: 'Very dark brown (#2b2320), loose waves, overgrown by a couple of months: falls across the forehead and curls over the ears and collar.',
    makeup: 'None. Stubble is constant across both days.',
    signature: [
      'Closed-back studio headphones (matte black, worn) round his neck whenever he is travelling or outdoors on day one.',
      'Two days of stubble, never clean-shaven.',
      'Hair across the forehead; he pushes it back when thinking.',
    ],
    wardrobe: [
      {
        id: 'player_travel',
        name: 'Arrival',
        description: 'Dark green waxed field jacket, charcoal henley, black jeans, scuffed brown leather boots. Headphones round his neck, a canvas duffel bag.',
        scenes: ['c1_ferry', 'c1_harbour', 'c1_hotel'],
      },
      {
        id: 'player_evening',
        name: 'Evening',
        description: 'The charcoal henley with sleeves pushed to the elbow, black jeans, boots. No jacket, no headphones.',
        scenes: ['c1_corridor', 'c1_dinner', 'c1_low_tide', 'c1_first_night', 'c1_night_vera', 'c1_night_noor', 'c1_night_letter'],
      },
      {
        id: 'player_cove',
        name: 'Night cove',
        description: 'The waxed jacket over the henley, jeans rolled to the knee, barefoot in the water.',
        scenes: ['c1_night_june'],
      },
      {
        id: 'player_day2',
        name: 'Day two',
        description: 'Faded blue-grey crew-neck sweatshirt, black jeans, boots. After the cove (low-tide path): mud to the knees and biro numbers on the left forearm.',
        scenes: ['c1_morning', 'c1_sienna_drive', 'c1_june_lowtide', 'c1_dusk'],
      },
      {
        id: 'player_storm',
        name: 'Storm',
        description: 'The waxed jacket over the sweatshirt, soaked, hair plastered flat. Indoors afterwards: jacket off, a towel round his neck, hair drying in every direction.',
        scenes: ['c1_storm', 'c1_aftermath', 'c1_margit_room', 'c1_cliffhanger'],
      },
    ],
    acting:
      'Still and watchful. He reacts a beat late and small: a raised eyebrow, a breath of a laugh through the nose. Tilts his head slightly when listening. Rubs the back of his neck when unsure. The player projects onto him, so keep his expressions readable but never broad.',
  },
  {
    character: 'vera',
    heightCm: 176,
    build: 'Tall and lean, long neck, straight posture, narrow shoulders held square. Athletic rather than soft.',
    face: 'Oval face, high cheekbones, straight nose, defined jaw. Thin, level eyebrows. A faint, pale scar through the outer third of the left eyebrow.',
    skin: 'Fair, cool undertone. Light freckling across the nose only visible in close-ups. Faint shadows under the eyes: she does not sleep enough.',
    eyes: 'Grey-blue, slightly hooded, steady. Never wide unless genuinely shocked.',
    hair: 'Ash blonde (#cdbf9e), fine and straight, shoulder length when down. Normally pinned in a neat low bun with one strand escaped at the left temple.',
    makeup: 'Almost none. Clear skin, neutral lip. No nail polish; short practical nails.',
    signature: [
      'The eyebrow scar (left).',
      'One loose strand of hair at the left temple whenever her hair is up.',
      'Shirt sleeves rolled exactly twice.',
      'Reading glasses (thin dark metal frame) only when working alone; she takes them off when someone comes in.',
    ],
    wardrobe: [
      {
        id: 'vera_coat',
        name: 'Arrival',
        description: 'Charcoal wool overcoat, knee length, over a navy waistcoat and white shirt, dark tailored trousers, flat black ankle boots.',
        scenes: ['c1_harbour', 'c1_hotel'],
      },
      {
        id: 'vera_work',
        name: 'Work',
        description: 'White cotton shirt with sleeves rolled twice, navy waistcoat, dark trousers. No coat.',
        scenes: ['c1_dinner', 'c1_morning'],
      },
      {
        id: 'vera_night',
        name: 'Night audit',
        description: 'Soft grey cardigan over the white shirt, collar open one button, hair half down. Reading glasses at the desk only.',
        scenes: ['c1_night_vera', 'c1_margit_room'],
      },
      {
        id: 'vera_storm',
        name: 'Storm',
        description: 'The work outfit under a dark navy waterproof jacket, soaked through; hair coming out of its bun, wet strands on her face. Indoors afterwards: jacket off, shirt still damp, hair down and roughly towelled.',
        scenes: ['c1_storm', 'c1_aftermath'],
      },
    ],
    acting:
      'Economical. Small expressions: a "smile" is one corner of the mouth; "angry" is stillness and a set jaw, never shouting. Arms crossed is her resting state with strangers. The rare unguarded moments (the dinner blush, the boathouse) should feel like a door opening.',
  },
  {
    character: 'noor',
    heightCm: 168,
    build: 'Average height, soft athletic build, strong forearms from bar work. Moves a lot; rarely stands straight.',
    face: 'Heart-shaped face, full cheeks that dimple when she grins, strong dark brows, wide expressive mouth.',
    skin: 'Warm medium brown (#b07a55), even tone, a small mole under the right eye.',
    eyes: 'Dark brown, large, quick. The first place her mood shows.',
    hair: 'Black-brown (#2a1d17), dense shoulder-length curls. Day one: mostly tucked under a knotted orange scarf. Afterwards: loose or tied back.',
    makeup: 'Minimal: defined brows, a little dark eyeliner, natural lip. Ink smudges on her right-hand fingers.',
    signature: [
      'A single gold hoop in the LEFT ear only.',
      'The orange scarf, on day one only (ferry, dinner, bar). It is a plot object: it must be absent from the piano scene onward.',
      'A bar towel over the right shoulder whenever she is working.',
      'Ink on her fingers.',
    ],
    wardrobe: [
      {
        id: 'noor_ferry',
        name: 'Crossing',
        description: 'Cream work shirt, olive canvas jacket, dark jeans, worn brown boots. Orange scarf knotted in her curls.',
        scenes: ['c1_ferry'],
      },
      {
        id: 'noor_bar',
        name: 'Behind the bar',
        description: 'Cream work shirt with sleeves rolled to the elbow, dark jeans, bar towel over the shoulder. Orange scarf (day one only).',
        scenes: ['c1_dinner', 'c1_low_tide'],
      },
      {
        id: 'noor_after',
        name: 'After hours',
        description: 'Same shirt, top button undone, sleeves down and loose, no scarf, curls free.',
        scenes: ['c1_night_noor'],
      },
      {
        id: 'noor_day2',
        name: 'Day two',
        description: 'Rust-coloured long-sleeve top, sleeves pushed up, dark jeans; curls tied back with a plain band. No scarf. Damp hair in the candle scenes.',
        scenes: ['c1_dusk', 'c1_aftermath'],
      },
    ],
    acting:
      'Big and warm. Talks with her hands, leans on things, tilts her head. Her "bar smile" (wide, practised) must look different from the real one (smaller, eyes creased, hand to mouth). When she is afraid she goes very still and keeps her hands busy.',
  },
  {
    character: 'june',
    heightCm: 158,
    build: 'Petite and compact, narrow shoulders, strong legs from field work. Tends to hunch over whatever she is holding.',
    face: 'Round face, small upturned nose, pointed chin, dense freckles over nose and cheeks. Bites her lower lip when thinking.',
    skin: 'Very fair, warm undertone, heavy freckling on face, shoulders and forearms; wind-chapped cheeks.',
    eyes: 'Green-hazel, wide-set, direct to the point of staring.',
    hair: 'Copper red (#b5562b), a short tousled crop with a longer fringe. Usually damp or salt-stiff.',
    makeup: 'None. Sunburned nose is fine.',
    signature: [
      'A chunky black waterproof watch on the left wrist, always.',
      'Freckles everywhere.',
      'Something in her hands: a jar, a notebook, a probe.',
    ],
    wardrobe: [
      {
        id: 'june_wetsuit',
        name: 'Field',
        description: 'Black full-length wetsuit with teal seams, unzipped a few centimetres at the collar; bare feet or neoprene boots; head torch at night.',
        scenes: ['c1_corridor', 'c1_night_june', 'c1_june_lowtide', 'c1_dusk'],
      },
      {
        id: 'june_jumper',
        name: 'Indoors',
        description: 'Oversized sage-green wool jumper with sleeves over her hands, faded black leggings, thick socks or field boots.',
        scenes: ['c1_dinner'],
      },
      {
        id: 'june_blanket',
        name: 'After the storm',
        description: 'The jumper, damp, under a grey hotel blanket round her shoulders; laptop on her knees.',
        scenes: ['c1_aftermath'],
      },
    ],
    acting:
      'Open and unguarded: every thought shows. Enthusiasm is whole-body (eyes wide, leaning in). Embarrassment is immediate and visible. She looks at objects more than at people; eye contact from June means something.',
  },
  {
    character: 'sienna',
    heightCm: 172,
    build: 'Slim, poised, long-limbed. Stands with her weight on one hip, perfectly balanced in heels.',
    face: 'Angular: strong cheekbones, narrow chin, arched brows, a mouth that rests in a slight smile.',
    skin: 'Olive (#d6a985), flawless and deliberately so.',
    eyes: 'Dark brown, almond-shaped, amused. She watches people decide things.',
    hair: 'Near-black (#1a1416) sharp chin-length bob with a centre parting, glossy and precise. After the storm: wet and wild, the only time it is out of place.',
    makeup: 'Polished: deep red lipstick that never smudges, defined eyes, subtle contour. After the storm: mascara run, lipstick gone.',
    signature: [
      'A cheap thread bracelet on the RIGHT wrist: faded blue fishing line in a complicated knot. It should look out of place against everything else she wears.',
      'Red lipstick (absent only after the storm).',
      'Heels on cobblestones.',
    ],
    wardrobe: [
      {
        id: 'sienna_city',
        name: 'City',
        description: 'Tailored camel wool coat, ivory silk blouse, high-waisted black trousers, black heels, a slim leather folder or handbag.',
        scenes: ['c1_low_tide', 'c1_dusk'],
      },
      {
        id: 'sienna_drive',
        name: 'Coast road',
        description: 'The camel coat open over a deep green silk blouse, black trousers, sunglasses pushed up into her hair, flat driving shoes.',
        scenes: ['c1_sienna_drive'],
      },
      {
        id: 'sienna_storm',
        name: 'Stranded',
        description: 'The coat soaked dark, heels in her hand, bare feet; later the coat off and a coarse wool hotel blanket round her shoulders.',
        scenes: ['c1_aftermath'],
      },
    ],
    acting:
      'Controlled and unhurried. Holds eye contact a beat too long. Smiles before she speaks. The armour drops three times in this chapter (the boat shed, off the record, the fire after the storm): in those shots, no smile, shoulders down, looking away.',
  },
  {
    character: 'bram',
    heightCm: 185,
    build: 'Big, broad and heavy-set, thick forearms, a slight stoop from thirty years at a stove.',
    face: 'Broad face, deep lines round the eyes, heavy brow, a nose broken long ago.',
    skin: 'Dark brown (#6e4a32). Old pale burn scars on both forearms and the backs of the hands.',
    eyes: 'Dark, small, kind. Usually half-closed against steam.',
    hair: 'Bald. Full grey-white beard (#a8a29a), trimmed short.',
    makeup: 'None.',
    signature: [
      'Burn scars on both forearms: they are mentioned in the story and must be visible whenever his sleeves are rolled.',
      'A white apron over his jumper.',
    ],
    wardrobe: [
      {
        id: 'bram_kitchen',
        name: 'Kitchen',
        description: 'Navy fisherman\'s jumper with sleeves pushed up, white bib apron, dark work trousers, clogs.',
        scenes: ['c1_hotel', 'c1_dinner', 'c1_morning', 'c1_dusk', 'c1_storm', 'c1_aftermath'],
      },
    ],
    acting: 'Still and slow. Says little, so his face does the work: a raised eyebrow, a slow nod. His laugh is sudden and takes over his whole chest.',
  },
];

/** People who appear only in photographs. */
export const photoOnlyCharacters = [
  {
    name: 'Margit Halloran (present day, 68)',
    description:
      'Wiry, weather-beaten, sharp blue eyes, cropped iron-grey hair. Yellow oilskin. Seen only in the final phone photograph on the ferry deck, looking straight into the camera.',
  },
  {
    name: 'Margit Halloran (thirty years ago, late thirties) and an unknown young woman (about twenty)',
    description:
      'A faded colour photograph on the deck of the blue lobster boat ELIN. Margit dark-haired and laughing; the young woman has an arm round her shoulders and holds up a large fish. Both are adults. The young woman\'s face should be clear but must not resemble any current character.',
  },
];

export const sets: SetBrief[] = [
  { id: 'ferry', name: 'Car ferry deck', description: 'Stern deck of a small, old car ferry: wet painted steel, white railings, coiled rope, an orange life ring, a passenger-lounge wall with a digital clock. Open sea and the island beyond.' },
  { id: 'harbour', name: 'Harbour and hill street', description: 'A small stone harbour with a ferry ramp, iron bollards and lamp posts; a steep cobbled street of whitewashed houses climbing to the hotel.' },
  { id: 'exterior', name: 'The Halcyon, exterior', description: 'A four-storey 1920s seaside hotel of weathered white stone on a cliff top: glass porch, brass front door, hanging porch lamps, a neon sign reading THE HAL YON (the C is dead). Front steps down to the road.' },
  { id: 'lobby', name: 'Lobby', description: 'Black-and-white chequered tiles, a curling staircase, worn velvet armchairs, a fireplace, a reception desk with brass pigeonholes, a key cabinet, a clock and a green banker\'s lamp. One corridor is closed with a velvet rope and a sign: EAST WING CLOSED. A green leather guest book lies on the desk.' },
  { id: 'kitchen', name: 'Hotel kitchen', description: 'A big, old working kitchen: hanging copper pans, a huge cast-iron range, a scrubbed wooden table, steam.' },
  { id: 'corridor', name: 'Bedroom corridor', description: 'A long corridor with wine-red carpet, brass room numbers, wall sconces and a tall window at the far end over the sea. The second-floor version ends in an unnumbered door.' },
  { id: 'dining', name: 'Dining room', description: 'A grand dining room built for a hundred, mostly dark. One long table near a large fireplace is set for six; the chair at the head stands slightly pulled out.' },
  { id: 'room12', name: 'Room 12', description: 'A guest room: brass bed, writing desk under the window, faded wallpaper with blue herons, a cast-iron radiator, a nightstand. The window looks down on the cove and a lighthouse.' },
  { id: 'bar', name: 'The Low Tide', description: 'A vaulted stone cellar bar under the hotel: a bar made from dark ship\'s timber, shelves of bottles, fairy lights tangled in old fishing nets, small tables, stone stairs up to a street door, and a battered upright piano with a taped sign: PLEASE DON\'T.' },
  { id: 'cove', name: 'The cove', description: 'A small sand-and-rock cove at the foot of the cliff, reached by a steep path. Black rocks, kelp, rock pools. Fifty metres out stands the rusted iron ring of an old mooring, exposed only at low tide.' },
  { id: 'terrace', name: 'Terrace', description: 'A stone terrace hanging over the cliff: wrought-iron tables and chairs, a low wall, the open sea below. A doorway leads back into the hotel.' },
  { id: 'road', name: 'Coast road and car', description: 'A narrow road round the island above the sea, and the interior of a dark modern rental car seen from the passenger seat.' },
  { id: 'factory', name: 'Fish factory and boat shed', description: 'A derelict fish factory with a half-collapsed roof and rusted machinery; beside it, a small boat shed with a faded blue door and MARLOWE painted above it.' },
  { id: 'boathouse', name: 'Boathouse and cliff steps', description: 'A stone boathouse at the foot of a hundred steps cut into the cliff: large wooden sea doors, a side door, a slipway. On the slipway sits an old blue wooden lobster boat with ELIN painted on the stern in white.' },
  { id: 'margit', name: "Margit's room", description: 'A lived-in bedroom-study frozen in March: crowded bookshelves, a brass barometer, a pipe rack, a desk under the window covered in hand-drawn sea charts, photographs pinned above it.' },
];

export const locations: LocationBrief[] = [
  { background: 'ferry_deck_dusk', set: 'ferry', lighting: 'Dusk at sea. Low orange sun behind cloud from screen right, cool blue shadows, warm rim light on faces and railings. Turns to blue hour by the end of the scene.' },
  { background: 'harbour_dusk', set: 'harbour', lighting: 'Last light. Sodium-warm harbour lamps as the key, deep blue sky fill, wet cobbles reflecting the lamps.' },
  { background: 'hotel_exterior_night', set: 'exterior', lighting: 'Night. Warm light spilling from the porch and ground-floor windows, cool moonlight and sea mist. Before the storm: black clouds, wind, swinging lamps.' },
  { background: 'hotel_exterior_storm', set: 'exterior', lighting: 'Storm at night. Almost no ambient light: windows, lightning flashes and torch beams only. Heavy sideways rain, spray.' },
  { background: 'hotel_lobby_evening', set: 'lobby', lighting: 'Evening. Warm tungsten lamps and a low fire, pools of light with dark corners.' },
  { background: 'hotel_lobby_late', set: 'lobby', lighting: 'After midnight. A single green banker\'s lamp on the reception desk; everything else in near darkness.' },
  { background: 'lobby_candlelight', set: 'lobby', lighting: 'Power cut. Dozens of candles and one hurricane lamp: warm, low, flickering key light from below face height, deep shadows.' },
  { background: 'hotel_kitchen_night', set: 'kitchen', lighting: 'Bright warm overhead light, steam catching it, copper reflections.' },
  { background: 'hotel_corridor_night', set: 'corridor', lighting: 'Dim wall sconces at intervals, cool night at the end window. In the power cut: a single candle.' },
  { background: 'dining_room_night', set: 'dining', lighting: 'Firelight from one side as the key, a few candles on the table, the rest of the room falling into darkness.' },
  { background: 'player_room_night', set: 'room12', lighting: 'Night. Moonlight through the window and one bedside lamp. Final scene: pre-dawn blue, lamp off, a lit phone screen.' },
  { background: 'low_tide_bar_night', set: 'bar', lighting: 'Open. Amber back-bar lights, fairy lights as bokeh, warm haze, cool night air at the top of the stairs.' },
  { background: 'low_tide_bar_closed', set: 'bar', lighting: 'Closed. Fairy lights and one lamp on the piano; chairs up on tables, most of the room dark.' },
  { background: 'cove_night', set: 'cove', lighting: 'Clear night with stars. Light comes from a head torch and from blue-green bioluminescence in the water, glowing wherever it is disturbed.' },
  { background: 'cove_low_tide_day', set: 'cove', lighting: 'Overcast afternoon, flat silver light, wet reflective mud and rock. Ends with a black storm front arriving over the sea.' },
  { background: 'hotel_terrace_morning', set: 'terrace', lighting: 'Bright, clear morning sun from the sea side; crisp shadows, glittering water.' },
  { background: 'island_road_day', set: 'road', lighting: 'Daylight through car windows; clear at midday, then storm cloud and first rain on the drive back.' },
  { background: 'fish_factory_day', set: 'factory', lighting: 'Flat grey overcast, soft shadowless light, muted colour.' },
  { background: 'boathouse_storm', set: 'boathouse', lighting: 'Storm at night. Torch beams as the only key light, lightning through the doors, rain and sea spray in the air.' },
  { background: 'margit_room_night', set: 'margit', lighting: 'Candlelight only: one or two candles, warm and close, the edges of the room dark.' },
];

/** Production milestones: groups of scenes to finish together, in order. */
export const milestones: { name: string; scenes: string[] }[] = [
  { name: 'The opening', scenes: ['c1_ferry', 'c1_harbour'] },
  { name: 'The first evening', scenes: ['c1_hotel', 'c1_corridor', 'c1_dinner', 'c1_low_tide'] },
  { name: 'The first night', scenes: ['c1_first_night', 'c1_night_vera', 'c1_night_noor', 'c1_night_june', 'c1_night_letter'] },
  { name: 'Day two', scenes: ['c1_morning', 'c1_sienna_drive', 'c1_june_lowtide', 'c1_dusk'] },
  { name: 'The storm and the ending', scenes: ['c1_storm', 'c1_aftermath', 'c1_margit_room', 'c1_cliffhanger'] },
];
