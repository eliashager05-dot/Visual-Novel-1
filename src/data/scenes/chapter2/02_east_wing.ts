import {
  affinity, bg, C, cg, choice, clock, effects, fx, mapChoice, me, milestone, music, narrate, option, scene, setFlag,
  sfx, shot, speaker, think, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');

// --- The east wing ----------------------------------------------------------
export const c2EastWing = scene('c2_east_wing', 'ch2', 'The East Wing', [
  bg('east_wing_lido', 'fade'),
  clock('midday'),
  fx({ dust: true }),
  music('mystery', 3),
  shot('c2_rope'),
  narrate(`Vera unhooks the velvet rope like someone taking a dressing off a wound. Behind it, a corridor runs dark and cold for forty metres, and then opens into light.`),
  sfx('door_creak'),
  shot('c2_lido_wide'),
  narrate(`The east wing isn't bedrooms. It's a swimming bath.`),
  narrate(`A long pool of green and white tiles under a vaulted glass roof, drained and dry, with brass handrails, a diving board, and changing cubicles with half-moon doors. Somebody's dream of the Riviera, built on a rock in the North Atlantic.`),
  narrate(`The storm has punched a hole in the roof. Rainwater lies in the deep end in a shallow, perfect mirror.`),
  vera(`The Halcyon Baths. Heated seawater, piped up from the cove. Margit's grandfather built them in 1926. They closed when I was seventeen, before I came. I never saw them full.`, 'neutral'),
  vera(`I learned to swim in this pool anyway. Empty. She stood me in the deep end and taught me the strokes on dry tiles, like a lunatic, and then she drove me to the cove and threw me in.`, 'happy'),
  me(`That sounds like a terrible way to learn.`),
  vera(`It was. I have never been so angry in my life. I swam out of pure spite.`, 'laughing'),
  shot('c2_lido_plaque'),
  narrate(`By the steps there's a brass plaque, green at the edges: THE HALCYON BATHS. BUILT BY THOMAS HALLORAN, 1926, SO THAT THE SEA MIGHT BE WARM FOR ONCE.`),
  me(`"So that the sea might be warm for once."`),
  vera(`Her grandfather. He was mad, apparently. All the Hallorans are mad. You are a Halloran, so please do not take that personally.`, 'neutral'),
  me(`I'll take it as a warning.`),
  vera(`Take it as a forecast.`, 'happy'),

  shot('c2_lido_footprints'),
  narrate(`Then you notice the floor. Twelve years of dust over everything, except for a path.`),
  narrate(`Footprints, small ones, from a side door to a square iron hatch in the floor of the shallow end. And back. And there again. Over and over, worn into the dust like a groove in a record.`),
  vera(`Nobody comes in here. Nobody.`, 'worried'),
  narrate(`You crouch by the hatch. Warm air breathes up through the gap at its edge: salt, engine oil, and something sweeter underneath.`),
  shot('c2_hatch_padlock'),
  vera(`…Captain Black.`, 'surprised'),
  me(`What?`),
  vera(`Pipe tobacco. Cherry. She smoked nothing else for forty years. I used to buy it for her in Bergen.`, 'worried'),
  narrate(`The hatch is held shut by a padlock. A new one: bright brass, no rust, half the price sticker still on it.`),
  me(`Everything in this wing is a hundred years old except that lock.`),
  vera(`The pump room is under there. The pipes go down through the rock to the cove. I have never been down. She told me it was dangerous.`, 'neutral'),
  vera(`I believed everything she told me.`, 'sad'),
  when(C.any(C.flag('june_manmade_theory'), C.flag('felt_vibration'), C.flag('june_mooring_hint')), [
    think(`Heated seawater, piped up from the cove. A pump. June's warm mud by the old mooring. It was never geology.`),
  ]),

  shot('c2_cubicle'),
  narrate(`The footprints pass one of the changing cubicles. Its half-moon door is open, and inside, on a hook, hangs a towel. Folded. Dry. This month's.`),
  narrate(`Pinned to the back of the door is a tide table for the cove, the kind the harbourmaster gives away free. Every night of August has its low water circled in red pencil. Tonight's is circled twice.`),
  narrate(`23:40. The lowest of the month.`),
  vera(`That is her pencil. She sharpened them with a fish knife. Look at the points.`, 'worried'),
  vera(`I have been setting her place at the staff table out of habit, {player}. For five months. And laughing at myself for doing it.`, 'sad'),
  me(`Vera. If she's alive, why would she hide from you?`),
  vera(`Because she was afraid of something. Margit was never afraid of anything, so it must be something very large.`, 'worried'),
  when(
    C.any(C.flag('sienna_off_record'), C.flag('june_knows_aldane_cove')),
    [
      vera(`Aldane wrote to her eleven times last winter. She burned the letters in the lobby fire without opening them. The twelfth one she opened.`, 'neutral'),
      vera(`After that she started locking her door.`, 'worried'),
    ],
    [vera(`Last winter a company wrote to her, again and again. She burned the letters without opening them. Then one day she opened one, and after that she locked her door.`, 'worried')],
  ),
  effects(setFlag('saw_tide_table')),

  // The ledger's last page, whoever kept it.
  when(
    C.flag('vera_has_ledger'),
    [vera(`There is something in the ledger you did not see. Inside the back cover.`, 'neutral')],
    [
      when(
        C.flag('has_ledger'),
        [narrate(`You take Margit's ledger out of your jacket, and Vera reads the inside of the back cover over your shoulder.`)],
        [
          vera(`I went back to her room at six this morning and took the ledger. I could not leave it lying there.`, 'neutral'),
          vera(`There is something written inside the back cover.`),
        ],
      ),
    ],
  ),
  shot('c2_ledger_licence'),
  narrate(`In Margit's small, furious capitals: MOORING LICENCE, THE COVE. BOUGHT BACK FROM S.M., MARCH. NOW THEY CANNOT HAVE IT.`),
  vera(`Whoever holds the licence for the old mooring decides what can be laid on the seabed of the cove. Pipes. Cables. Anything.`, 'worried'),
  think(`S.M. Paid in full. Not a debt. A purchase. Margit bought the bottom of the cove out from under somebody.`),
  effects(setFlag('knows_mooring_licence')),

  choice(
    'c2_lido',
    [
      option('her', `"Tell me about her. Not the hotel. Her."`, {
        effects: [affinity('vera', 5), trust('vera', 2), milestone('vera', 'deep_end')],
        steps: [
          cg('cg_lido_vera'),
          narrate(`Vera sits down on the edge of the deep end and lets her legs hang over the drop, the way you would sit on a pier. After a moment you sit beside her.`),
          vera(`She was the most impossible woman I have ever met.`, 'neutral'),
          vera(`She shouted at suppliers in four languages. She gave rooms away to anyone with a sad story and then charged the rich guests double to make up for it. She told them it was a heritage surcharge.`, 'happy'),
          vera(`When I came here I had one bag and nowhere to go back to. She did not ask why. She asked if I could work nights, and if I could swim. I said yes to both. I lied about the second one.`),
          vera(`She knew, of course. She always knew.`, 'sad'),
          vera(`She said: the water holds you up if you stop fighting it.`, 'sad'),
          vera(`I have never once managed to stop fighting it.`),
          when(C.trust('vera', { gte: 25 }), [
            narrate(`Her shoulder is against yours. Neither of you moves it.`),
            vera(`Do not tell Bram I said any of this. He will be insufferable for a month.`, 'embarrassed'),
          ]),
          cg(null),
        ],
      }),
      option('police', `"We should get the police over here."`, {
        effects: [trust('vera', 2), setFlag('wants_police')],
        steps: [
          vera(`With what? The phones are down and the ferry is not running.`, 'neutral'),
          vera(`And when they come, what do we tell them? That the lock is new and the dust smells of tobacco?`),
          vera(`…But you are right. When the ferry runs, I will call them. Whatever is under this floor.`, 'worried'),
        ],
      }),
      option('lock', `"Let's break the lock."`, {
        effects: [affinity('vera', -2), setFlag('tried_lock')],
        steps: [
          narrate(`There's a fire axe in a glass case by the door, which feels like the building making a point.`),
          vera(`No.`, 'angry'),
          vera(`If she is down there, she put that lock on so that I could not come in. I want her to open it herself. I want her to look at me when she does.`, 'sad'),
          think(`I've never heard anyone sound so angry and so hopeful in the same breath.`),
        ],
      }),
    ],
    'The hatch.',
  ),

  narrate(`Before you leave, Vera kneels and puts her ear to the iron of the hatch, the way you would listen at a door.`),
  narrate(`You kneel beside her. Through the metal, faint and slow, comes a sound: a deep, regular thud. Thud. Thud. Like something breathing in its sleep.`),
  vera(`The pump. It is running.`, 'surprised'),
  vera(`Twelve years closed, and it is running.`, 'worried'),
  effects(setFlag('heard_pump')),
  shot('c2_vera_leaving_lido'),
  vera(`I have a hotel with no ferry, no phones and four leaking rooms. I am going to be extremely busy and not think about this at all.`, 'neutral'),
  vera(`Do something useful with your afternoon, {player}. And be back before dark.`),
  when(C.milestone('vera', 'deep_end'), [vera(`…Thank you. For asking about her, and not the money.`, 'happy')]),
  fx(null),
  clock('afternoon'),
  mapChoice(
    'c2_afternoon',
    'island',
    [
      option('noor', `Help Noor bail out the Low Tide.`, { place: 'low_tide', goto: { scene: 'c2_noor_bar' } }),
      option('june', `Meet June at the old mooring for slack water, 14:50.`, { place: 'cove', goto: { scene: 'c2_june_slack' } }),
      option('sienna', `Walk out to the causeway and help Sienna with her car.`, { place: 'causeway', goto: { scene: 'c2_sienna_causeway' } }),
      option('vera', `Stay and help Vera keep the hotel standing.`, { place: 'hotel', goto: { scene: 'c2_vera_roof' } }),
    ],
    'How do you spend the afternoon?',
  ),
]);
