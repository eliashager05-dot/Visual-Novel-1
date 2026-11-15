import {
  affinity, bg, C, cg, choice, hide, jump, me, music, narrate, option, scene, setFlag, sfx, show, speaker, think,
  title, trust, when, expr,
} from '../../story/dsl';

const noor = speaker('noor');
const stranger = (text: string, e?: Parameters<typeof noor>[1]) => noor(text, e, { as: '???' });

export const c1Ferry = scene('c1_ferry', 'ch1', 'The Crossing', [
  title('Chapter One', 'Low Tide'),
  bg('ferry_deck_dusk', 'fade'),
  music('crossing', 2),
  sfx('gull'),
  narrate(
    'The ferry to Halcyon Point runs twice a day in summer and once a day the rest of the year. Nobody mentioned it would smell this strongly of diesel and wet rope.',
  ),
  think('Three weeks ago I didn\'t know this island existed. Now I own half a hotel on it. Slightly more than half.'),
  narrate('The solicitor\'s letter has gone soft from folding. Margit Elin Halloran. Presumed deceased. Fifty-one percent.'),
  think(
    'A great-aunt I met once, when I was six. She gave me a shell and told me to listen for the storm inside it. That\'s the entire relationship.',
  ),
  narrate('Further along the rail, someone is having a worse crossing than you.'),
  show('noor', { position: 'right', expression: 'worried', pose: 'leaning' }),
  sfx('phone_buzz'),
  stranger('No — I said Friday. I said I\'d have it by Friday.', 'worried'),
  stranger('…Yeah. I know what happens if I don\'t.', 'sad'),
  narrate('She ends the call, stares at the phone as if it bit her, then shoves it into her coat and grips the rail with both hands.'),

  choice('c1_ferry_upset', [
    option('ask', 'Ask if she\'s alright.', {
      effects: [affinity('noor', 5), trust('noor', 3), setFlag('noor_ferry_asked')],
      steps: [
        me('Rough call?'),
        stranger('Oh — God, was I loud? I was loud. Every gull on this boat now knows my business.', 'surprised'),
        me('The gulls seemed sympathetic.'),
        stranger('They\'re not. They\'re thieves. One took an entire sandwich out of my hand in May.', 'laughing'),
        stranger('I\'m fine. Really. Money stuff. Boring grown-up money stuff.', 'neutral'),
        think('She says "fine" the way people do when they need you to agree with them.'),
      ],
    }),
    option('joke', 'Try to lighten the mood.', {
      effects: [affinity('noor', 3), setFlag('noor_ferry_joked')],
      steps: [
        me('For what it\'s worth, I hear the island has excellent ocean views. From every side.'),
        stranger('…Was that a joke? Was that a geography joke?', 'surprised'),
        me('It was an attempt.'),
        stranger('It was a terrible one. I respect it enormously.', 'laughing'),
        stranger('Sorry. You caught me mid-crisis. It\'s a weekly thing. Don\'t worry about it.', 'neutral'),
      ],
    }),
    option('space', 'Give her some space.', {
      effects: [trust('noor', 2), setFlag('noor_ferry_space')],
      steps: [
        narrate('You turn back to the water. Some things aren\'t yours to fix on a ferry.'),
        narrate('After a minute, she drifts down the rail toward you anyway.'),
        stranger('Thanks for not staring. Everyone on this boat stares. It\'s a very small boat.', 'neutral'),
      ],
    }),
  ]),

  cg('cg_ferry_noor'),
  narrate('The island rises out of the haze — a dark hump of rock, a lighthouse, a scatter of lit windows climbing a hill.'),
  stranger('You\'re not a tourist. Tourists photograph the water. You\'ve been reading the same piece of paper since we left.', 'flirty'),
  cg(null),

  choice('c1_ferry_paper', [
    option('truth', 'Tell her about the inheritance.', {
      effects: [trust('noor', 3), setFlag('told_noor_inheritance')],
      steps: [
        me('My great-aunt left me part of a hotel. The Halcyon.'),
        stranger('You\'re Margit\'s—', 'surprised'),
        expr('noor', 'sad'),
        stranger('Oh. I\'m sorry. She was… she was really something.', 'sad'),
        think('Something in her voice closes, quietly, like a door pulled to.'),
      ],
    }),
    option('deflect', 'Say it\'s just work.', {
      effects: [affinity('noor', 1)],
      steps: [
        me('Work thing. Paperwork.'),
        stranger('Mysterious. Fine, ferry person, keep your secrets. Small island, though. I\'ll know by breakfast.', 'flirty'),
      ],
    }),
  ]),

  sfx('ferry_horn'),
  noor('That\'s us. Welcome to Halcyon Point. Population: not enough.', 'happy'),
  noor('I\'m Noor, by the way. I pour drinks at the Low Tide.', 'neutral'),
  when(
    C.flag('told_noor_inheritance'),
    [noor('Which is in your hotel, apparently. So I suppose that makes you my boss. Slightly. Fifty-one percent.', 'laughing')],
    [
      when(
        C.flag('noor_ferry_joked'),
        [noor('Come by sometime. First drink\'s half price — for the geography.', 'flirty')],
        [noor('Come by sometime. I\'m better company when I\'m not on the phone.', 'happy')],
      ),
    ],
  ),
  hide('noor', 'fade'),
  jump('c1_harbour'),
]);
