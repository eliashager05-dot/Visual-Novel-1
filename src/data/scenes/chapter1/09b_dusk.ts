import {
  affinity, bg, C, choice, effects, fx, jump, me, music, narrate, option, scene, setFlag, sfx, shot, speaker,
  text, think, trust, when,
} from '../../story/dsl';

const sienna = speaker('sienna');
const june = speaker('june');
const noor = speaker('noor');
const bram = speaker('bram');

/**
 * Before the storm. Whoever you did NOT spend the afternoon with gets a short
 * beat here, so every lead has at least two scenes on every path.
 */
export const c1Dusk = scene('c1_dusk', 'ch1', 'Before the Storm', [
  bg('hotel_exterior_night', 'dissolve'),
  fx({ fog: 'light' }),
  music('old_rooms', 2),
  shot('c1_dusk_porch'),
  when(C.variable('hotel_stance', { eq: 'together' }), [
    text('vera', `Storm warning upgraded. Generator fuel is in the boathouse. Tell Bram if you see him. — V`, { quiet: true }),
  ]),
  narrate(`By six the wind has teeth. The sky over the sea has gone from bruise to black, and the Halcyon's porch lights have come on early, swinging on their chains.`),

  when(
    C.flag('spent_afternoon_sienna'),
    [
      // June didn't get the afternoon: she's hauling gear alone.
      shot('c1_dusk_june_crates'),
      narrate(`June is struggling up the front steps with a crate of instruments, a coil of cable over one shoulder and her hair plastered flat with spray.`),
      june(`Don't — I'm fine — I have a system—`, 'worried'),
      narrate(`The system involves dropping the cable. You catch it.`),
      june(`…The system has been updated to include you.`, 'embarrassed'),
      june(`I've pulled every sensor except the one at the old mooring. It's bolted to the iron ring. I couldn't get it out before the tide came back.`, 'neutral'),
      june(`It'll record through the storm. If it survives, we'll have the first data from inside a gale. If it doesn't, I've lost four hundred pounds of equipment I can't replace.`),
      choice('c1_dusk_june', [
        option('carry', `Carry the rest of her crates in.`, {
          effects: [affinity('june', 3), trust('june', 2)],
          steps: [
            narrate(`Four more crates. On the last trip she holds the door for you and says, to the door rather than to you:`),
            june(`Thank you. People don't usually stay to help with the boring part.`, 'happy'),
          ],
        }),
        option('sienna', `Tell her what Sienna said about Aldane and the cove.`, {
          effects: [trust('june', 4), setFlag('june_knows_aldane_cove')],
          steps: [
            june(`The seabed? They said the seabed?`, 'surprised'),
            june(`Nobody wants a seabed. A seabed is mud. Unless there's something in the mud.`, 'worried'),
            think(`She says it like a hypothesis. It sounds more like a warning.`),
          ],
        }),
      ]),
    ],
    [
      // Sienna didn't get the afternoon: she comes to the hotel.
      sfx('car_door'),
      shot('c1_dusk_sienna_car'),
      narrate(`A dark rental car pulls up at the bottom of the steps, wipers going hard. Sienna gets out with a leather folder held over her hair.`),
      sienna(`You stood me up for plankton.`, 'flirty'),
      me(`How do you know it was plankton?`),
      sienna(`Small island. Also, you have mud to the knees.`, 'laughing'),
      sienna(`I've brought the formal offer. Forty pages. Lawyers love a margin.`, 'neutral'),
      choice('c1_dusk_folder', [
        option('take', `Take the folder.`, {
          effects: [affinity('sienna', 2), setFlag('has_offer_folder')],
          steps: [
            sienna(`Read page thirty-one first. That's where they hide the cove.`, 'neutral'),
            think(`She just told me where the catch is. In her own offer.`),
          ],
        }),
        option('refuse', `"Leave it with Vera. We decide together."`, {
          effects: [trust('sienna', 2), trust('vera', 2), setFlag('folder_to_vera')],
          steps: [
            sienna(`Partners. How quaint. And how annoying.`, 'neutral'),
            sienna(`Fine. I'll leave it at the desk. Vera can set it on fire, she has the fireplace for it.`, 'happy'),
          ],
        }),
      ]),
      sienna(`Storm's a big one. I'd stay off the water tonight, {player}. Anyone with sense will.`, 'worried'),
      narrate(`She drives off down the hill, tail-lights smearing in the rain. Nobody on the steps says the obvious thing: that the road out to the Anchor floods first.`),
    ],
  ),

  bg('low_tide_bar_night'),
  fx({ dust: true }),
  shot('c1_dusk_noor_shutters'),
  narrate(`Down at the Low Tide, Noor is dragging sandbags against the bar's street door, swearing at each one by name.`),
  noor(`This one's Gerald. Gerald is the heaviest. Gerald has never once helped me.`, 'angry'),
  choice('c1_dusk_noor', [
    option('help', `Grab the other end of Gerald.`, {
      effects: [affinity('noor', 3)],
      steps: [
        narrate(`Gerald is, in fact, outrageously heavy. Between you, he goes into place.`),
        noor(`Look at that. Teamwork. Disgusting.`, 'laughing'),
        when(C.flag('helped_noor_song'), [noor(`The fourth, by the way. I've been playing it all day. I hate you a bit.`, 'flirty')]),
      ],
    }),
    option('ask', `"Are you okay? After last night — after Sienna?"`, {
      effects: [trust('noor', 3)],
      steps: [
        noor(`Am I okay.`, 'surprised'),
        noor(`Nobody asks me that in a voice like they want the answer.`, 'sad'),
        noor(`No. But I'm better than I was yesterday. Ask me again after the storm.`, 'neutral'),
      ],
    }),
  ]),

  shot('c1_dusk_bram'),
  narrate(`Back up on the porch, Bram is standing with his face turned to the sea, sleeves rolled up, rubbing the burn scars on his forearms.`),
  bram(`Told you.`, 'neutral'),
  think(`The first gust hits the building like a shoulder against a door. Somewhere inside, a window rattles in its frame. The lights flicker once — and hold.`),
  effects(setFlag('saw_storm_arrive')),
  jump('c1_storm'),
], { replayable: true });
