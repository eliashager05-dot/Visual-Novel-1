import {
  affinity, bg, C, cg, choice, effects, hide, jump, me, music, narrate, option, scene, setFlag, sfx, shot, speaker, think,
  transition, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const bram = speaker('bram');
const noor = speaker('noor');
const june = speaker('june');
const sienna = speaker('sienna');

// --- The storm: the unexpected event ------------------------------------
export const c1Storm = scene('c1_storm', 'ch1', 'The Storm', [
  hide('*'),
  bg('hotel_exterior_storm', 'fade'),
  music('storm', 2),
  sfx('thunder'),
  shot('c1_storm_facade'),
  narrate(`By eight the storm has the island by the collar. Rain comes sideways. The sea throws itself at the cliff, and the Halcyon groans like a ship at anchor.`),
  bg('hotel_lobby_evening'),
  shot('c1_storm_lobby'),
  narrate(`In the lobby, Vera is on the phone to the harbourmaster. Bram is taping the porch windows in big X shapes, muttering to the glass.`),
  vera(`…Yes. Thank you, Arne. Goodnight.`, 'neutral'),
  vera(`He says the harbour is closed and nothing is moving on the water. Nothing will move until morning.`, 'worried'),
  vera(`He says it as if that is good news. It is a hotel. It is never good news when nobody can get here.`),
  sfx('power_down'),
  transition('black', 1.6),
  bg('lobby_candlelight', 'none'),
  shot('c1_storm_dark'),
  narrate(`Then every light in the building goes out at once.`),
  narrate(`In the dark: the clock. The rain. Vera swearing softly in Swedish. The scratch of Bram striking a match.`),
  effects(setFlag('vera_heard_swearing')),
  shot('c1_storm_bram_match'),
  bram(`Generator's in the boathouse. And the boathouse doors are open. I can hear them from here.`, 'worried'),
  think(`He's right. Under the rain there's a heavy, rhythmic slam — wood on stone, every gust.`),
  vera(`If those doors go, the roof goes with them. Bram, stay with the guests.`, 'neutral'),
  when(
    C.variable('hotel_stance', { eq: 'together' }),
    [vera(`Partner. With me.`, 'neutral')],
    [vera(`You have hands. Come on.`, 'neutral')],
  ),

  bg('boathouse_storm'),
  sfx('rain_heavy'),
  shot('c1_boathouse_run'),
  narrate(`The boathouse sits at the bottom of a hundred stone steps cut into the cliff. You go down them in the dark, by torchlight, with the sea snatching at the lowest ones.`),
  narrate(`Inside: water over the slipway, the big doors swinging, Vera's torch beam swinging with them. You get one door. She gets the other. The bar drops into its brackets with a bang you feel in your teeth.`),
  shot('c1_boathouse_find'),
  narrate(`Then Vera's torch finds the slipway, and stops.`),
  cg('cg_storm_boathouse'),
  narrate(`There is a boat on the slipway. Wooden, blue-hulled, an old lobster boat with a name painted on the stern in white: ELIN.`),
  vera(`That is not possible.`, 'surprised'),
  me(`Whose is it?`),
  vera(`Margit's. That is Margit's boat. The police took it to the mainland in March. I signed the form.`, 'worried'),
  when(C.flag('asked_about_boat'), [think(`"Evidence, they said. Evidence of what, I asked."`)]),
  narrate(`The hull is wet — not storm-wet. Salt-wet, with weed still caught on the rudder. The engine cover ticks softly as it cools.`),
  think(`Ticking. It's been running. Within the last hour.`),
  when(C.flag('heard_engine_sound'), [
    think(`The sound under the floor last night. Like an engine, very far down. Not under the floor. Under the cliff.`),
  ]),
  when(C.flag('felt_vibration'), [think(`The hum in the warm mud this afternoon. The same note. I'd swear it's the same note.`)]),
  cg(null),
  sfx('thunder'),
  shot('c1_boathouse_figure'),
  narrate(`Something moves at the far end of the boathouse: a shape in a dark oilskin, by the side door. For half a second the torch catches it. Then it's gone, out into the storm.`),

  choice(
    'c1_storm_choice',
    [
      option('chase', `Chase the figure.`, {
        effects: [setFlag('chased_figure'), setFlag('found_scarf')],
        steps: [
          shot('c1_storm_chase'),
          narrate(`You go out into the rain. The cliff path has become a stream. Ahead, a shape without a torch takes the steps two at a time, like someone who knows every one of them by heart.`),
          narrate(`You slip. By the time you look up, they're gone.`),
          shot('c1_storm_scarf'),
          narrate(`On the step where you fell lies something soft and sodden. You pick it up: an orange scarf.`),
          think(`I've seen this scarf. Yesterday, on the ferry.`),
          shot('c1_boathouse_vera_after'),
          vera(`You left me in a flooding boathouse to chase a raincoat.`, 'angry'),
          me(`Yes.`),
          vera(`…Did you catch it?`, 'worried'),
          me(`No.`),
          vera(`Then next time, take the torch.`, 'neutral'),
        ],
      }),
      option('vera', `Stay with Vera.`, {
        effects: [trust('vera', 5), affinity('vera', 3), setFlag('found_scarf'), setFlag('vera_found_scarf'), setFlag('stayed_with_vera')],
        steps: [
          narrate(`You put a hand on Vera's arm. She's shaking — from cold or shock, you can't tell.`),
          me(`Vera. Look at me. Breathe.`),
          narrate(`She turns, and her foot finds the wet slipway and goes out from under her.`),
          narrate(`You catch her. For a moment she's completely still, one hand fisted in your coat, her breath warm against your neck.`),
          shot('c1_storm_vera_close'),
          vera(`…Thank you.`, 'embarrassed'),
          vera(`You can let go now.`),
          when(C.trust('vera', { gte: 20 }), [
            vera(`Actually. Give me one more second.`, 'sad'),
            narrate(`She doesn't move. Neither do you. The storm goes on without either of you.`),
            effects(setFlag('vera_moment'), affinity('vera', 3)),
          ]),
          narrate(`When you finally let go, she bends and picks something up from the slipway by the side door. An orange scarf, soaked through.`),
          vera(`That is Noor's.`, 'worried'),
        ],
      }),
    ],
    'Vera has frozen. The figure is getting away.',
  ),

  narrate(`You climb back up together, wet to the bone, carrying the boat and the scarf and the question with you.`),
  shot('c1_storm_steps'),
  vera(`Do not tell the others about the boat. Not tonight.`, 'worried'),
  me(`Why not?`),
  vera(`Because one of the people in that lobby may already know. And I would like to see who looks surprised in the morning.`, 'neutral'),
  when(
    C.variable('hotel_stance', { eq: 'together' }),
    [vera(`We tell them together. Tomorrow. Agreed?`, 'neutral'), me(`Agreed.`)],
    [think(`It's the most sensible thing anyone has said all day. I hate how much it frightens me.`)],
  ),
  jump('c1_aftermath'),
], { replayable: true });

// --- Aftermath -----------------------------------------------------------
export const c1Aftermath = scene('c1_aftermath', 'ch1', 'Candles', [
  bg('lobby_candlelight', 'fade'),
  music('aftermath', 3),
  shot('c1_candle_wide'),
  narrate(`The lobby by candlelight looks like a painting of itself. Bram has lit every candle in the building. The retired couple are playing cards by a hurricane lamp, still arguing, apparently delighted.`),
  narrate(`June is wrapped in a blanket on the stairs, soaked through, guarding three crates of equipment like a dragon.`),
  narrate(`Noor comes in through the bar door, shaking rain out of her hair. Her bare hair. No scarf.`),
  noor(`Bar's flooded to the second step. Again. I've moved the good bottles up. And the bad ones, because people will drink anything in a blackout.`, 'neutral'),

  sfx('door_creak'),
  shot('c1_sienna_arrives'),
  narrate(`The front door bangs open, and the storm throws Sienna Marlowe into the lobby — soaked, mascara running, heels in her hand.`),
  sienna(`Road's gone at the causeway. Car's in a ditch. I'm grand, don't—`, 'worried'),
  narrate(`She stops, hearing her own accent come back, and visibly packs it away again.`),
  sienna(`I need a room. I'll pay double.`, 'neutral'),
  vera(`We are full.`, 'angry'),
  bram(`We've four guests and thirty-one rooms, Vera.`, 'neutral'),
  vera(`We are full of principle.`, 'angry'),

  choice(
    'c1_sienna_room',
    [
      option('yes', `"Give her a room."`, {
        effects: [affinity('sienna', 4), trust('sienna', 2), setFlag('gave_sienna_room')],
        steps: [
          vera(`…Fine. Room nine. It has a draught.`, 'angry'),
          sienna(`Thank you, {player}. I'll remember this.`, 'happy'),
          when(
            C.variable('hotel_stance', { eq: 'together' }),
            [
              vera(`We said together.`, 'neutral'),
              me(`We did. I'm sorry. I couldn't send her back out into that.`),
              vera(`…No. Neither could I. I only wanted to be the one who said no.`, 'sad'),
              effects(trust('vera', -2)),
            ],
            [effects(affinity('vera', -2))],
          ),
        ],
      }),
      option('vera', `"It's Vera's call."`, {
        effects: [trust('vera', 4), trust('sienna', 1)],
        steps: [
          vera(`…`, 'surprised'),
          vera(`Room nine. It has a draught. Breakfast is at seven, and it is not included.`, 'neutral'),
          sienna(`Generous.`, 'flirty'),
        ],
      }),
      option('no', `"Sorry. We're full of principle."`, {
        effects: [affinity('vera', 3), affinity('sienna', -2), setFlag('sienna_in_lounge')],
        steps: [
          sienna(`Oh, that's cold.`, 'laughing'),
          sienna(`…Fair.`, 'neutral'),
          bram(`Kid.`, 'sad'),
          bram(`She'll take the lounge sofa, then. Noor, find her a blanket.`, 'neutral'),
          noor(`Absolutely not.`, 'angry'),
          narrate(`Noor finds her a blanket. She throws it rather than hands it, but she finds it.`),
        ],
      }),
    ],
    'Vera looks at you. Fifty-one percent.',
  ),

  shot('c1_sienna_blanket'),
  narrate(`Sienna finds you by the fire a little later, wrapped in one of Bram's blankets, her coat steaming on a chair.`),
  sienna(`Can I tell you something strange? You'll think I hit my head in the ditch.`, 'worried'),
  sienna(`On the causeway, just before the car went off the road, I saw lights out on the water. Out past the cove. Around half seven.`),
  sienna(`A boat. In that. Nobody with a working brain takes a boat out in that.`),
  think(`Half seven. Nothing moving on the water, the harbourmaster said.`),
  sienna(`Forget it. I was tired, and the rain was doing things.`, 'neutral'),
  effects(setFlag('sienna_saw_lights')),

  shot('c1_noor_candle'),
  narrate(`Later, when most of the others have drifted upstairs with candles, Noor is alone by the bar door, staring down at the black water on the steps.`),
  shot('c1_candle_player'),
  when(
    C.flag('vera_found_scarf'),
    [narrate(`On the stairs, Vera pressed the scarf into your hands without a word. It's in your pocket now, still wet.`)],
    [narrate(`The scarf is in your pocket, still wet.`)],
  ),

  choice(
    'c1_scarf',
    [
      option('gentle', `Show her the scarf and ask, gently.`, {
        effects: [trust('noor', 6), affinity('noor', 2), setFlag('noor_confessed_march')],
        steps: [
          me(`I found this in the boathouse.`),
          shot('c1_noor_candle'),
          noor(`…I lost that last night. I thought it was behind the bar.`, 'surprised'),
          me(`Noor.`),
          noor(`I wasn't there tonight. I swear on — on anything you like. I was in the bar with a mop.`, 'worried'),
          noor(`But I was there in March. The night she went out.`, 'sad'),
          noor(`She asked me to help with the ropes. She said if anyone asked, I hadn't seen her. So I promised.`),
          noor(`I've kept that promise for five months, and it's been eating me alive.`, 'sad'),
          think(`She was wearing it on the ferry, and by this morning it was gone. So someone took it. And tonight, someone wanted it found.`),
        ],
      }),
      option('accuse', `"Were you in the boathouse tonight?"`, {
        effects: [trust('noor', -4), affinity('noor', -3), setFlag('accused_noor'), setFlag('noor_hint_vera_key')],
        steps: [
          shot('c1_noor_candle'),
          noor(`What? No! I was mopping the—`, 'angry'),
          narrate(`She sees the scarf in your hand, and her face goes very still.`),
          noor(`Where did you get that.`, 'worried'),
          me(`You tell me.`),
          noor(`I don't owe you anything, fifty-one percent.`, 'angry'),
          noor(`Ask Vera how long she's had a key to the boathouse. Then come back and accuse me.`, 'sad'),
          narrate(`She goes down into the dark bar and doesn't come back up.`),
        ],
      }),
      option('keep', `Keep the scarf to yourself for now.`, {
        effects: [setFlag('kept_scarf_secret')],
        steps: [
          narrate(`You say goodnight instead. She smiles the bar smile at you, and you let her.`),
          think(`Not tonight. Not until I know what I'm actually asking her.`),
        ],
      }),
    ],
    'The scarf.',
  ),

  shot('c1_june_stairs'),
  narrate(`June hasn't gone up. She's on the stairs with a laptop on her knees, the screen the only cold light in the room.`),
  june(`{player}. Come and look at this.`, 'worried'),
  june(`My sensor at the old mooring logged a temperature spike at seven forty tonight. Four degrees in ten minutes. Then it dropped back.`),
  june(`Like something switched on. And then off.`),
  when(
    C.flag('spent_afternoon_june'),
    [june(`Same place we were standing this afternoon. The warm mud.`, 'neutral')],
    [june(`I was out there this afternoon. The mud was nineteen degrees. The sea is eleven.`, 'neutral')],
  ),
  think(`Seven forty. And the boat's engine was still ticking when we found it, just before nine.`),

  choice('c1_june_data', [
    option('share', `Tell her about the boat in the boathouse.`, {
      effects: [trust('june', 4), affinity('june', 2), setFlag('june_knows_boat')],
      steps: [
        june(`Margit's boat? But it's on the—`, 'surprised'),
        june(`Then someone took it out to the mooring tonight, in a storm, and something under the water switched on.`, 'worried'),
        june(`That isn't a coincidence. That's a variable.`, 'neutral'),
      ],
    }),
    option('sleep', `"Get some sleep. We'll look at it in daylight."`, {
      effects: [affinity('june', 3)],
      steps: [
        june(`Sleep is a statistically poor use of a storm.`, 'neutral'),
        june(`…But thank you. Nobody tells me to sleep. Margit used to.`, 'happy'),
      ],
    }),
  ]),
  jump('c1_margit_room'),
], { replayable: true });
