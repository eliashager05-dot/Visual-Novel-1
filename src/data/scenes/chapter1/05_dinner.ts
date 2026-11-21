import {
  affinity, bg, C, choice, effects, fx, hide, jump, me, music, narrate, option, scene, setFlag, setVar, sfx,
  shot, speaker, think, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const june = speaker('june');
const noor = speaker('noor');
const bram = speaker('bram');

export const c1Dinner = scene('c1_dinner', 'ch1', 'Dinner', [
  bg('dining_room_night', 'fade'),
  fx({ flicker: 'lamp', dust: true }),
  music('old_rooms', 2),
  shot('c1_dining_wide'),
  narrate(`The dining room was built for a hundred guests. Tonight it holds one long table by the fire, set for six, and a silence the size of the other ninety-four.`),
  narrate(`Vera sits at one side with a stack of papers she is pretending not to read. Bram comes and goes with plates. June is at the far end, hair still damp, reading a journal propped against the water jug.`),
  narrate(`The chair at the head of the table is empty. It's pulled out slightly, as if someone just stood up.`),

  choice('c1_dinner_seat', [
    option('vera', `Sit next to Vera.`, {
      effects: [affinity('vera', 2), setVar('dinner_seat', 'vera')],
      steps: [
        shot('c1_dinner_vera'),
        vera(`You can sit anywhere, you know. You own fifty-one percent of the chairs.`, 'neutral'),
        me(`I like this one.`),
        vera(`It wobbles.`, 'happy'),
        think(`That was almost a smile. I'll take it.`),
      ],
    }),
    option('june', `Sit next to June.`, {
      effects: [affinity('june', 2), setVar('dinner_seat', 'june')],
      steps: [
        shot('c1_dinner_june'),
        june(`You're blocking my light.`, 'neutral'),
        june(`No — sorry. Stay. I'll move the candle. I'm told I say things like that.`, 'embarrassed'),
      ],
    }),
    option('head', `Take the chair at the head of the table.`, {
      effects: [trust('vera', -2), affinity('bram', 2), setFlag('sat_in_margit_chair'), setVar('dinner_seat', 'head')],
      steps: [
        narrate(`The room goes quiet. Even the fire seems to hold its breath.`),
        shot('c1_dinner_vera_sad'),
        vera(`That was her chair.`, 'sad'),
        bram(`Somebody has to sit in it eventually, Vera.`, 'neutral'),
        vera(`…Yes. I suppose somebody does.`, 'sad'),
        think(`Brilliant. Six hours on the island and I've sat on a ghost.`),
      ],
    }),
  ]),

  when(C.flag('june_plumber_joke'), [
    shot('c1_dinner_june'),
    june(`Vera, why is the plumber at dinner?`, 'surprised'),
    vera(`That is not the plumber. That is the owner.`, 'neutral'),
    june(`…I asked the owner to fix my shower.`, 'embarrassed'),
    me(`In fairness, I said I'd take a look.`),
    june(`That's actually funny. I'm going to be embarrassed about it for roughly a year, but it's funny.`, 'laughing'),
    effects(affinity('june', 2)),
  ]),

  shot('c1_dining_wide'),
  bram(`So what is it you do, kid? When you're not inheriting things.`, 'neutral'),
  shot('c1_dinner_player'),
  think(`There it is. The question I've been dodging for six weeks.`),
  choice('c1_dinner_job', [
    option('honest', `Tell them the truth: the studio closed.`, {
      effects: [trust('vera', 2), trust('june', 2), affinity('bram', 2), setFlag('told_studio_truth')],
      steps: [
        me(`I'm a sound engineer. Was. I mixed records at a studio in the city for nine years.`),
        me(`It closed in June. The building's going to be flats. I spent my last day there helping them carry the mixing desk out to a van.`),
        shot('c1_dining_wide'),
        june(`That's sad.`, 'sad'),
        june(`Sorry. I'm told people usually say something more useful than "that's sad".`, 'embarrassed'),
        me(`No. It was sad. That's the right word.`),
        vera(`So you came here with nothing to go back to.`, 'neutral'),
        vera(`…I do not mean that unkindly. I did the same thing, once.`, 'sad'),
      ],
    }),
    option('joke', `Make it sound better than it is.`, {
      effects: [affinity('bram', 1), setFlag('dodged_studio')],
      steps: [
        me(`I'm between studios. Taking a sabbatical. Exploring opportunities in the hospitality sector.`),
        shot('c1_dining_wide'),
        bram(`Sounds like unemployed with extra syllables.`, 'laughing'),
        me(`…It does, doesn't it.`),
        june(`What did you do before you were between things?`, 'neutral'),
        me(`Sound. Mixing records. I listen for a living. Listened.`),
      ],
    }),
    option('listen', `"I listen to things. Professionally."`, {
      effects: [affinity('june', 2), affinity('vera', 1), setFlag('told_listener')],
      steps: [
        me(`I listen to things. Professionally. Records, mostly. Nine years making other people's songs sound like what they meant.`),
        shot('c1_dining_wide'),
        june(`So you notice frequencies.`, 'surprised'),
        me(`I notice everything. It's a curse at parties.`),
        june(`Same.`, 'happy'),
        june(`Different reason. Same curse.`),
        vera(`Margit would have liked that answer.`, 'sad'),
      ],
    }),
  ]),

  shot('c1_dinner_vera_papers'),
  vera(`Since we are all here. The figures, briefly, because you will hear them from someone less accurate.`, 'neutral'),
  vera(`Bookings are down forty percent on last year. The roof needs work we cannot afford. And in the spring Margit borrowed against the building, and I do not know what she spent it on.`),
  me(`You don't know?`),
  vera(`She did not tell me. She told me everything, and she did not tell me that.`, 'worried'),
  shot('c1_dinner_june'),
  june(`She spent some of it on—`, 'surprised'),
  june(`Never mind. I don't actually know what I was going to say.`, 'embarrassed'),
  think(`June is the worst liar I've ever met. That's almost reassuring.`),
  effects(setFlag('june_slip')),

  sfx('door_creak'),
  shot('c1_dinner_noor'),
  noor(`Don't get up. Nobody ever gets up. I'm stealing bread and leaving.`, 'happy'),
  when(
    C.flag('told_noor_inheritance'),
    [noor(`Evening, boss. Fifty-one-percent boss.`, 'flirty')],
    [noor(`Evening, ferry person. So it's true — you're the heir. Told you I'd know by breakfast. I'm early.`, 'flirty')],
  ),
  noor(`Oh — and before anyone hears it from the harbourmaster: Sienna Marlowe's back. Came in on the afternoon boat. Room at the Anchor and a car she definitely didn't rent from anyone here.`, 'worried'),
  narrate(`Vera's fork stops halfway to her mouth.`),
  vera(`Of course she is.`, 'angry'),
  me(`Who's Sienna Marlowe?`),
  bram(`Island girl. Left at eighteen. Came back with a coat that costs more than my van.`, 'neutral'),
  noor(`She works for Aldane. The resort people. They've been sending letters about the hotel since spring.`, 'neutral'),
  vera(`Letters Margit burned in that fireplace.`, 'angry'),
  june(`They want the cove too. They sent a surveyor in June. He asked if the glowing was "a health and safety issue".`, 'angry'),
  june(`It's a dinoflagellate bloom. It is the least dangerous thing on this island.`),
  noor(`Anyway. She'll come to you. She always goes to whoever's new.`, 'neutral'),
  noor(`Bar's open till one. First drink's on the house. Second one too, if you tell me something interesting.`, 'flirty'),
  hide('noor'),

  shot('c1_dining_wide'),
  choice('c1_dinner_topic', [
    option('vera_plan', `Ask Vera what she'd do if the decision were hers alone.`, {
      effects: [trust('vera', 3), setFlag('heard_vera_plan')],
      steps: [
        shot('c1_dinner_vera'),
        vera(`Keep it open. Close the east wing properly. Sell the boat—`, 'neutral'),
        vera(`There is no boat now. Sorry.`, 'sad'),
        vera(`I would keep it open. That is the honest answer, and it is not a business plan.`, 'neutral'),
      ],
    }),
    option('june_cove', `Ask June what makes the cove special.`, {
      effects: [affinity('june', 3), setFlag('june_invited_cove')],
      steps: [
        shot('c1_dinner_june'),
        june(`Short version: the bloom shouldn't exist. Long version takes four hours and a whiteboard.`, 'neutral'),
        me(`I've got time.`),
        june(`Nobody has time.`, 'surprised'),
        june(`…Come down to the cove some night when it's glowing. I'll do the twenty-minute version.`, 'happy'),
      ],
    }),
    option('bram', `Ask Bram how long he's worked here.`, {
      effects: [affinity('bram', 3), affinity('vera', 1)],
      steps: [
        bram(`Thirty-one years. Four ovens. Three managers. One Margit.`, 'neutral'),
        bram(`Best of the lot is the current one.`, 'happy'),
        vera(`Bram.`, 'embarrassed'),
        bram(`Manager. I meant the oven.`, 'laughing'),
      ],
    }),
  ]),

  narrate(`Dinner ends the way island dinners apparently do: nobody leaves, the fire just gets lower. Eventually Bram starts stacking plates loudly enough to count as a hint.`),
  jump('c1_low_tide'),
], { replayable: true });
