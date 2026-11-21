import {
  affinity, bg, C, cg, choice, effects, fx, jump, me, milestone, music, narrate, option, scene, setFlag, sfx,
  shot, speaker, think, trust, when,
} from '../../story/dsl';

const sienna = speaker('sienna');
const june = speaker('june');

// --- Sienna: the coast road ---------------------------------------------
export const c1SiennaDrive = scene('c1_sienna_drive', 'ch1', 'Coast Road', [
  bg('island_road_day', 'fade'),
  music('coast_road', 2),
  sfx('car_door'),
  shot('c1_sienna_car'),
  narrate(`Sienna drives the way she talks: fast, precise, one hand on the wheel. The coast road loops the whole island in forty minutes if you don't stop. She stops everywhere.`),
  sienna(`Lunch is a pretext. You know that.`, 'happy'),
  me(`I assumed.`),
  sienna(`Good. I'm going to show you the island the way a buyer sees it. Then you can decide whether you want to be the person who keeps it exactly as it is.`, 'neutral'),
  sienna(`That's the ferry pier. Twice a day in summer, once in winter, twice a year not at all.`),
  sienna(`That's the school. Fourteen children. When I was there, there were sixty.`),
  me(`When you were there.`),
  sienna(`…You noticed.`, 'surprised'),
  sienna(`Yes. I'm from here. I left. People here have strong opinions about both of those facts.`, 'neutral'),
  effects(setFlag('sienna_is_local')),

  bg('fish_factory_day'),
  shot('c1_factory_wide'),
  narrate(`She parks by a derelict building at the north end of the island: a fish factory, roof half gone, gulls nesting in the rusted machinery.`),
  sienna(`Aldane wants to make this a spa. The hotel becomes the "heritage wing". The cove becomes a private marina.`, 'neutral'),
  sienna(`Two hundred jobs, all year round. Those fourteen children get to stay.`),
  think(`It's a good speech. She's given it before. But she isn't looking at me while she gives it. She's looking past me, at a shed.`),

  shot('c1_sienna_shed'),
  narrate(`Beside the factory stands a small boat shed with a faded blue door. Someone painted MARLOWE above it, a long time ago.`),
  cg('cg_sienna_shed'),
  sienna(`My father's. He had one boat and one bad winter. The bank took the boat. Then the house. Then, more or less, him.`, 'sad'),
  sienna(`After he died, somebody paid off the rest of his debts. Anonymously. I was twenty-two, and furious, because I'd finally got angry enough to leave — and suddenly I owed a stranger.`),
  think(`Anonymous. On an island this size, that narrows it down.`),

  choice('c1_sienna_shed', [
    option('sorry', `"I'm sorry about your father."`, {
      effects: [trust('sienna', 3)],
      steps: [
        sienna(`Don't be. Be sorry about the island. It does that to people.`, 'neutral'),
        sienna(`…Thank you, though.`, 'sad'),
      ],
    }),
    option('bracelet', `Ask about the thread bracelet on her wrist.`, {
      effects: [trust('sienna', 4), affinity('sienna', 3), milestone('sienna', 'bracelet')],
      steps: [
        sienna(`…Nobody notices that.`, 'surprised'),
        sienna(`He made it. Fishing line and a knot he swore would hold a whale. It's held twenty years.`, 'sad'),
        sienna(`Don't tell anyone in a suit.`, 'embarrassed'),
      ],
    }),
    option('pitch', `"Is this part of the sales pitch?"`, {
      effects: [affinity('sienna', 1), trust('sienna', 1)],
      steps: [
        sienna(`Everything is part of the pitch, {player}. That's what makes it work.`, 'angry'),
        sienna(`But no. This part isn't.`, 'neutral'),
      ],
    }),
  ]),

  cg(null),
  shot('c1_sienna_close'),
  when(
    C.trust('sienna', { gte: 5 }),
    [
      narrate(`She's quiet for a long moment. Then, without looking at you:`),
      sienna(`Can I tell you something off the record?`, 'worried'),
      me(`Is anything off the record with you?`),
      sienna(`Almost nothing. This is.`, 'neutral'),
      sienna(`Aldane doesn't care about the hotel. They'd knock it down tomorrow. It's the cove they want — the cove, and the seabed under it — and they won't tell me why.`, 'worried'),
      sienna(`I've closed eleven deals for them. I've never once been told "don't ask". I don't like it.`),
      effects(milestone('sienna', 'off_record'), setFlag('sienna_off_record')),
    ],
    [sienna(`Anyway. That's the tour. Think about the number, {player}. It won't stay on the table forever.`, 'neutral')],
  ),
  when(C.flag('flirted_sienna'), [
    sienna(`And I still owe you that dinner. Don't think I've forgotten. I never forget a negotiation.`, 'flirty'),
  ]),
  when(C.flag('read_letter'), [think(`"Whatever Aldane offers, ask them why." Margit got there first.`)]),

  bg('island_road_day'),
  shot('c1_sienna_car_storm'),
  fx({ rain: 'light' }),
  narrate(`She drives you back as the clouds come in from the west, black and low and fast.`),
  sienna(`Weather's turning. Storm warning tonight. Tell Vera to bring the boats in—`, 'worried'),
  sienna(`Habit. Sorry. There's only the one boat at the Halcyon, isn't there. And it's gone.`, 'sad'),
  effects(setFlag('spent_afternoon_sienna')),
  jump('c1_dusk'),
], { replayable: true });

// --- June: low tide ------------------------------------------------------
export const c1JuneLowTide = scene('c1_june_lowtide', 'ch1', 'Low Tide', [
  bg('cove_low_tide_day', 'fade'),
  music('bloom', 2),
  shot('c1_june_lowtide_wide'),
  narrate(`At low tide the cove shows its bones: black rock, ribbons of kelp, rock pools like dropped mirrors. And fifty metres out, usually hidden, the rusted iron ring of an old mooring, standing up out of the mud.`),
  june(`You came. Good. Hold this. Don't let go of it. Don't let go of it even if I say something alarming.`, 'happy'),
  narrate(`The ladder is aluminium, the mud is deep, and June climbs down into a channel beside the mooring with a temperature probe and complete faith in you.`),
  when(C.flag('june_plumber_joke'), [june(`Also, my shower is still broken. I assume the plumbing portion of your duties has been postponed.`, 'neutral')]),
  shot('c1_june_probe'),
  june(`Oh. Oh, that's — {player}, read me the number on the display.`, 'surprised'),
  me(`Nineteen point four.`),
  june(`The sea is eleven degrees. The mud is nineteen.`, 'worried'),
  june(`Something under this is warm.`),

  choice('c1_june_ladder', [
    option('steady', `Hold the ladder and keep reading her numbers.`, {
      effects: [affinity('june', 4), trust('june', 3), milestone('june', 'field_partner')],
      steps: [
        narrate(`For forty minutes you are a very good ladder. June calls out numbers. When the notebook gets soaked, you write them on your forearm in biro.`),
        shot('c1_lowtide_player_arm'),
        june(`You wrote them on your arm.`, 'surprised'),
        me(`The notebook got wet.`),
        june(`That's the most scientific thing anyone has done for me in a year.`, 'laughing'),
      ],
    }),
    option('climb', `Climb down and feel it for yourself.`, {
      effects: [trust('june', 3), affinity('june', 2), setFlag('felt_vibration')],
      steps: [
        narrate(`You go down the ladder into the channel. The mud closes round your ankles — warm. Actually warm, like bathwater.`),
        think(`And under the warmth, the faintest vibration. Like a fridge humming in another room. Like the sound under the floor.`),
        june(`Out of the channel, please, the tide's turning and I'm not explaining you to Vera.`, 'worried'),
      ],
    }),
    option('ask', `"What could make mud warm?"`, {
      effects: [trust('june', 4), setFlag('june_manmade_theory')],
      steps: [
        june(`Volcanic activity — there isn't any. Decomposition — not this much. Or something man-made. A pipe. A cable. A machine.`, 'neutral'),
        june(`Margit thought it was the last one.`, 'worried'),
      ],
    }),
  ]),

  when(C.not(C.flag('june_funding_revealed')), [
    when(C.trust('june', { gte: 10 }), [
      shot('c1_june_confess'),
      june(`I should tell you something. Margit paid for all of this. The equipment, my room, my rent — after the university cut my funding.`, 'worried'),
      june(`I didn't tell Vera because Margit asked me not to. And now Margit's gone, and the money's gone, and I don't know who I'm keeping the secret for.`, 'sad'),
      effects(setFlag('june_funding_revealed'), trust('june', 2)),
    ]),
  ]),

  fx({ rain: 'light' }),
  shot('c1_june_front'),
  narrate(`The wind changes while you're climbing out. The sky over the sea goes the colour of a bruise.`),
  june(`That's a front. A big one. I need my sensors out of the water before—`, 'worried'),
  june(`Help me carry? Please?`),
  narrate(`You haul crates up the cliff path together as the first rain hits like thrown gravel.`),
  effects(setFlag('spent_afternoon_june')),
  jump('c1_dusk'),
], { replayable: true });
