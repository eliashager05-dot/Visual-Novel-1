import {
  affinity, bg, C, choice, clock, effects, mapChoice, me, milestone, music, narrate, option, phone, reply,
  scene, setFlag, setVar, sfx, shot, speaker, text, think, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const bram = speaker('bram');

export const c1Morning = scene('c1_morning', 'ch1', 'Ninety Days', [
  bg('hotel_terrace_morning', 'fade'),
  clock('morning', 2),
  music('morning', 3),
  shot('c1_terrace_wide'),
  narrate(`Morning comes in bright and salty. The terrace hangs over the cliff like a held breath. Breakfast is coffee strong enough to strip paint and bread still warm from Bram's oven.`),
  when(C.flag('vera_slept'), [
    narrate(`There's a note under your cup in very straight handwriting: "Nothing caught fire. Thank you. — V." Then, smaller, as if added later: "I slept seven hours. I had forgotten that was possible."`),
  ]),
  when(C.flag('has_shell'), [narrate(`Margit's shell is in your pocket. You keep touching it without meaning to.`)]),
  shot('c1_terrace_bram'),
  bram(`Morning, kid. Eat the bread while it's angry.`, 'happy'),
  bram(`Storm coming tonight.`, 'neutral'),
  me(`The sky's completely clear.`),
  bram(`I've got burns on both arms from forty years of ovens. They ache before weather. Sky can say what it likes.`, 'neutral'),
  narrate(`He goes back inside. Below the terrace, the sea is flat and blue and absolutely innocent.`),
  think(`Six weeks ago I'd have been asleep until noon, then eating cereal over a sink in a flat I can't afford. Now I'm on a cliff with a view and a debt. I'm not sure which is worse. I'm not sure I want to go back to find out.`),
  sfx('phone_buzz'),
  narrate(`At nine your phone rings. A mainland number.`),
  shot('c1_terrace_phone'),
  narrate(`"Mr. Achterberg, of Achterberg and Dey." His voice has the texture of expensive paper. "I'm afraid I'm calling with news rather than condolences."`),
  narrate(`"The bank has called in Ms. Halloran's loan. You have ninety days to repay it in full — or to present the bank with a joint plan for the property, signed by both owners."`),
  narrate(`"Failing that, they will force a sale. And I'm obliged to tell you that only one buyer has expressed an interest."`),
  think(`Ninety days. Both signatures. Mine, and Vera's. And one buyer.`),

  shot('c1_terrace_vera'),
  narrate(`Vera is standing in the terrace doorway. She has heard enough of it.`),
  vera(`The bank.`, 'neutral'),
  me(`Ninety days.`),
  vera(`They called me first. Last week. I told them to wait until you arrived.`, 'angry'),
  me(`You knew last week.`),
  vera(`I knew last week. I did not know you.`, 'neutral'),
  vera(`So. You have fifty-one percent of a decision. What do you want to do?`),

  choice(
    'c1_hotel_stance',
    [
      option('keep', `"Keep it open. We'll find the money."`, {
        effects: [setVar('hotel_stance', 'keep'), affinity('vera', 5), trust('vera', 2)],
        steps: [
          vera(`You say that as if it is simple.`, 'surprised'),
          me(`It isn't simple. It's what she wanted.`),
          vera(`…Yes. It is.`, 'happy'),
        ],
      }),
      option('listen', `"We hear Aldane's offer properly before we decide anything."`, {
        effects: [setVar('hotel_stance', 'listen'), trust('vera', 2), affinity('vera', -2), affinity('sienna', 2)],
        steps: [
          vera(`Of course.`, 'angry'),
          me(`Hearing isn't agreeing. If we say no, I want to know exactly what we're saying no to.`),
          vera(`…That is annoyingly reasonable.`, 'neutral'),
        ],
      }),
      option('together', `"Neither of us decides alone. Not this, not anything."`, {
        effects: [setVar('hotel_stance', 'together'), trust('vera', 6), affinity('vera', 2), milestone('vera', 'first_truce')],
        steps: [
          vera(`Meaning?`, 'neutral'),
          me(`Meaning we're partners. Every decision about this place, we make together. Even the ones I'd lose.`),
          narrate(`Vera looks at you for a long moment, the way she looks at a column of figures she suspects of hiding something.`),
          vera(`…Agreed.`, 'neutral'),
          shot('c1_terrace_handshake'),
          narrate(`She holds out her hand. Her grip is firm and still cold from the morning air, and she holds on a second longer than a handshake needs.`),
        ],
      }),
    ],
    'The first real decision about the Halcyon.',
  ),

  shot('c1_terrace_wide'),
  sfx('phone_message'),
  text('sienna', `Lunch? I'll drive. Wear shoes you can walk in. — S.`, { as: 'Unknown number' }),
  choice('c1_sienna_text', [
    option('where', `"Maybe. Depends where."`, {
      effects: [affinity('sienna', 1)],
      steps: [reply('sienna', `Maybe. Depends where.`), text('sienna', `Everywhere. It's a small island.`)],
    }),
    option('who', `"Who is this?"`, {
      steps: [reply('sienna', `Who is this?`), text('sienna', `You kept the napkin. I know you did.`)],
    }),
    option('read', `Leave it on read.`, {
      steps: [narrate(`You put the phone face down. It buzzes once more, and you don't look.`), text('sienna', `Bold. I like bold. 12:30.`)],
    }),
  ]),
  phone(null),
  narrate(`Under your saucer, someone has slid a note while you were on the phone, in tiny, very neat capitals: LOW TIDE 14:10. NEED SOMEONE TO HOLD A LADDER. YOU HAVE HANDS. — J.C.`),
  think(`The developer who wants to buy the cove, or the scientist who wants to understand it.`),
  when(
    C.variable('hotel_stance', { eq: 'together' }),
    [vera(`Go wherever you are going. I have a hotel to keep open for ninety days. Tell me what you learn.`, 'neutral')],
    [vera(`I have work.`, 'neutral'), narrate(`She's gone before you can decide whether that was a dismissal.`)],
  ),
  effects(setFlag('knows_deadline')),

  mapChoice(
    'c1_afternoon',
    'island',
    [
      option('sienna', `Lunch with Sienna. She'll pick you up for a drive.`, { place: 'road', goto: { scene: 'c1_sienna_drive' } }),
      option('june', `Hold June's ladder at low tide, 14:10.`, { place: 'cove', goto: { scene: 'c1_june_lowtide' } }),
    ],
    'How do you spend the afternoon?',
  ),
]);
