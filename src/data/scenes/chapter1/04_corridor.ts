import {
  affinity, bg, C, choice, jump, me, narrate, option, scene, setFlag, sfx, shot, speaker, think, trust, when,
} from '../../story/dsl';

const june = speaker('june');
const stranger = (text: string, e?: Parameters<typeof june>[1]) => june(text, e, { as: '???' });

export const c1Corridor = scene('c1_corridor', 'ch1', 'Room 7', [
  bg('hotel_corridor_night', 'dissolve'),
  shot('c1_corridor_empty'),
  narrate(`The first-floor corridor runs the length of the building: carpet the colour of old wine, brass numbers on every door, and at the far end a tall window full of black sea.`),
  think(`The building ticks and settles around me. Old wood, old pipes. Every room on this floor hums at a slightly different pitch. Occupational hazard: I hear everything.`),
  sfx('splash'),
  narrate(`Wet footsteps, coming fast up the back stairs.`),
  shot('c1_june_collision'),
  narrate(`You turn just in time to be hit by a small woman in a dripping wetsuit, carrying a crate of glass jars that clink alarmingly.`),
  stranger(`Don't — jars! Mind the jars!`, 'surprised'),
  narrate(`You catch the crate. She catches two jars in mid-air. Nothing breaks, which feels like a small miracle for both of you.`),
  stranger(`Thank you. That's four hours of tide samples, and the tide doesn't do refunds.`, 'neutral'),
  shot('c1_june_squint'),
  stranger(`You're the plumber.`, 'neutral'),
  stranger(`Vera said a plumber was coming. Room seven. The shower produces water at exactly two temperatures: glacial and theoretical.`),

  choice('c1_june_plumber', [
    option('play', `Play along.`, {
      effects: [affinity('june', 3), setFlag('june_plumber_joke')],
      steps: [
        me(`Theoretical how?`),
        stranger(`It is hot in theory. In practice you'd need an extremely optimistic thermometer.`, 'neutral'),
        me(`I'll take a look in the morning.`),
        stranger(`Excellent. You're the first tradesperson on this island who hasn't told me it's "probably fine".`, 'happy'),
      ],
    }),
    option('correct', `Tell her who you are.`, {
      effects: [trust('june', 3), setFlag('june_knows_owner')],
      steps: [
        me(`I'm not the plumber. I'm Margit's — I'm the new owner. Part-owner.`),
        stranger(`Oh.`, 'surprised'),
        stranger(`Oh, that's — I'm sorry. About Margit. I'm sorry.`, 'worried'),
        stranger(`Are you selling?`, 'neutral'),
        me(`I haven't decided.`),
        stranger(`Most people who say that have decided.`, 'neutral'),
        stranger(`Sorry. That came out exactly the way I meant it, which is usually the problem.`, 'embarrassed'),
      ],
    }),
    option('jars', `Ask about the jars.`, {
      effects: [affinity('june', 5), setFlag('june_plankton_talk')],
      steps: [
        me(`What's in the jars?`),
        shot('c1_june_lights_up'),
        stranger(`Dinoflagellates. Single-celled plankton. When they're disturbed, they emit light. Bioluminescence.`, 'happy'),
        stranger(`Most bays get a bloom in late summer. This cove gets one every month of the year, which should be impossible, which is why I live in a hotel with a broken shower.`),
        stranger(`Sorry. That was a lot of plankton.`, 'embarrassed'),
        me(`It was the right amount of plankton.`),
        stranger(`…Nobody has ever said that to me.`, 'surprised'),
      ],
    }),
  ]),

  june(`I'm June. Juniper Castell. Doctor, technically, though the doctorate is in the kind of thing that makes people leave parties.`, 'neutral'),
  when(
    C.flag('june_plumber_joke'),
    [june(`Room seven. Morning. Bring a wrench and low expectations.`, 'happy')],
    [june(`Room seven, if you need — I don't know why you'd need me. But that's where I am.`, 'neutral')],
  ),
  june(`If you're awake late, look out at the cove. Some nights the water lights up.`, 'neutral'),
  june(`Most people find it less interesting than I do. That's fine. It keeps happening whether they look or not.`),
  narrate(`She pads off down the corridor, leaving a trail of seawater and the smell of the tide.`),

  bg('player_room_night'),
  shot('c1_room12'),
  narrate(`Room twelve: a brass bed, a writing desk, wallpaper with faded blue herons, and a radiator that does, in fact, sing — a low, wavering B-flat.`),
  think(`Somewhere below, the bar's music thumps up through the floor. The sea underneath that. And under the sea, if I'm honest, my own heartbeat, going faster than it has in months.`),
  jump('c1_dinner'),
], { replayable: true });
