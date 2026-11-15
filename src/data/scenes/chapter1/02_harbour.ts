import {
  affinity, bg, C, choice, expr, jump, label, me, music, narrate, option, scene, setFlag, show, speaker, think,
  trust, when, shot,
} from '../../story/dsl';

const vera = speaker('vera');

export const c1Harbour = scene('c1_harbour', 'ch1', 'The Harbour', [
  bg('harbour_dusk', 'dissolve'),
  music('halcyon_theme', 3),
  narrate('At the bottom of the ramp, a woman in a charcoal coat holds a small, precisely lettered sign. It reads: {player}.'),
  show('vera', { position: 'center', pose: 'arms_crossed', expression: 'neutral' }),
  shot('c1_harbour_sign'),
  vera('{player}. You were on the manifest, and you look like your passport photo. That is rarer than you would think.', 'neutral', { as: '???' }),
  shot('c1_harbour_vera_close'),
  vera('Vera Lindqvist. I manage the Halcyon.', 'neutral'),

  when(
    C.flag('told_noor_inheritance'),
    [
      vera('Noor has already told the harbourmaster who you are. The harbourmaster has told everyone else.', 'worried'),
      me('That was fast.'),
      vera('It is an island. Gossip is the only thing here that travels faster than weather.', 'neutral'),
    ],
    [vera('You will be the most interesting thing to happen here this week. I apologise in advance.', 'neutral')],
  ),

  vera('I will be direct, since we will be making decisions together. Margit left me the other forty-nine percent.', 'neutral'),
  think('Ah. So that\'s why the sign is so neat. She\'s been rehearsing this.'),

  choice('c1_vera_first', [
    option('undecided', '"I haven\'t decided anything yet."', {
      effects: [trust('vera', 4), affinity('vera', 2)],
      steps: [vera('Good. Then you can still be persuaded.', 'neutral', { pose: 'standing' })],
    }),
    option('sell', '"Honestly? I\'ll probably sell."', {
      effects: [trust('vera', 3), affinity('vera', -3), setFlag('player_leans_sell')],
      steps: [
        shot('c1_harbour_vera_angry'),
        vera('…', 'angry'),
        shot('c1_harbour_vera_close'),
        vera('Thank you for not pretending. Most people pretend.', 'neutral'),
      ],
    }),
    option('dinner', '"Shouldn\'t we at least have dinner before discussing mergers?"', {
      effects: [affinity('vera', 3), setFlag('vera_flustered')],
      steps: [
        shot('c1_harbour_vera_flustered'),
        vera('I—', 'embarrassed'),
        expr('vera', 'neutral', 'standing'),
        shot('c1_harbour_vera_close'),
        vera('Dinner is at eight. Bram has made fish. Bram has always made fish.', 'neutral'),
        jump({ label: 'walk' }),
      ],
    }),
  ]),

  // Only reached by the two options that don't jump ahead.
  vera('We should go. The hill is steeper than it looks, and it looks steep.', 'neutral'),

  label('walk'),
  shot('c1_harbour_walk'),
  narrate('She takes your bag before you can object, and walks up the hill as though she expects you to keep pace.'),
  narrate('The street climbs between whitewashed houses with their curtains already drawn. A dog watches you pass from a doorstep with professional interest.'),
  vera('The island is four miles long. One shop, one school, one pub that is not ours, and a church nobody attends but everybody repairs.', 'neutral'),
  vera('In winter it is eight hundred people and the wind. In summer it is eight hundred people, the wind, and whoever the ferry brings.'),
  me('Which am I?'),
  vera('That depends on whether you are still here in winter.', 'neutral'),
  think('It is not, I notice, a no.'),
  jump('c1_hotel'),
], { replayable: true });
