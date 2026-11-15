import {
  affinity, bg, C, choice, jump, me, milestone, music, narrate, option, scene, setFlag, sfx, shot, speaker, think,
  trust, when,
} from '../../story/dsl';

const noor = speaker('noor');
const sienna = speaker('sienna');

export const c1LowTide = scene('c1_low_tide', 'ch1', 'The Low Tide', [
  bg('low_tide_bar_night', 'fade'),
  music('low_tide', 2),
  shot('c1_bar_wide'),
  narrate(`The Low Tide is down a flight of stone steps, under the hotel's foundations: a vaulted cellar, a bar made from a ship's timber, fairy lights tangled in old fishing nets, and in the corner a battered upright piano with a sign taped to it: PLEASE DON'T.`),
  narrate(`Half the island seems to be here. Fishermen. Two women playing cards for matchsticks. The retired couple from upstairs, arguing about a crossword clue in stage whispers.`),
  shot('c1_bar_noor'),
  noor(`Look who survived dinner. Sit. Not that stool — that stool has a grudge.`, 'happy'),
  noor(`What are you drinking? And don't say "whatever". "Whatever" is how I get rid of my worst gin.`, 'flirty'),

  choice('c1_bar_drink', [
    option('hers', `"Make me whatever you'd drink."`, {
      effects: [affinity('noor', 4)],
      steps: [
        noor(`Bold. Okay.`, 'flirty'),
        narrate(`She builds something amber with a twist of burnt orange peel and slides it over.`),
        noor(`The Long Way Round. My own. Nobody orders it because nobody knows it exists.`, 'neutral'),
        me(`It's good.`),
        noor(`I know. It's nice to hear, though.`, 'happy'),
      ],
    }),
    option('margit', `"What did Margit drink?"`, {
      effects: [trust('noor', 3), affinity('noor', 1), setFlag('margit_drink')],
      steps: [
        noor(`…Dark rum. Neat. One ice cube, which she'd fish out with her fingers after a minute.`, 'sad'),
        noor(`Said it was "for the sound".`),
        narrate(`She pours it. The ice cube clinks once against the glass.`),
        think(`For the sound. I get that, actually.`),
      ],
    }),
    option('water', `"Just water. Long day."`, {
      effects: [affinity('noor', 1)],
      steps: [
        noor(`Wise. Boring, but wise.`, 'neutral'),
        noor(`I'll put lemon in it so you look interesting.`, 'happy'),
      ],
    }),
  ]),

  noor(`So. How was the welcome committee? Vera give you the speech?`, 'neutral'),
  me(`Which speech?`),
  noor(`"This is not a hotel. This is a responsibility." She gave it to me when I started. I was twenty-three and extremely hungover.`, 'laughing'),
  noor(`She's good, you know. Vera. She just thinks if she stops moving, the roof falls in.`, 'neutral'),
  noor(`Sometimes she's right.`, 'sad'),

  sfx('door_creak'),
  music('sienna_theme', 2),
  narrate(`The door at the top of the steps opens, and the temperature of the room changes.`),
  shot('c1_bar_sienna_entrance'),
  narrate(`The woman coming down the stairs is dressed for a city: camel coat, dark bob, red lipstick, heels that somehow manage the worn stone. Conversations dip as she passes, then pick up a notch louder, the way people talk when they're pretending not to watch someone.`),
  sienna(`Noor. Still pouring? I thought you'd be famous by now.`, 'neutral', { as: '???' }),
  shot('c1_bar_noor_tense'),
  noor(`Sienna. Still selling? I thought you'd be rich by now.`, 'neutral'),
  sienna(`Touché.`, 'happy', { as: '???' }),
  narrate(`Noor's smile stays exactly where it is. Her hands, polishing a glass that is already clean, don't stop moving.`),
  shot('c1_bar_sienna_close'),
  sienna(`And you must be {player}. Sienna Marlowe.`, 'neutral'),
  sienna(`Don't worry, I'm not going to talk business in a bar. It's vulgar, and the acoustics are terrible.`, 'happy'),
  narrate(`She takes a napkin, writes a figure on it with a fountain pen, and slides it across. It has more zeroes than the hotel has guests.`),
  shot('c1_bar_player_napkin'),
  sienna(`I just wanted to see your face when you read it.`, 'flirty'),
  shot('c1_bar_sienna_close'),

  choice('c1_sienna_offer', [
    option('listen', `"I'm listening."`, {
      effects: [affinity('sienna', 3), setFlag('open_to_offer')],
      steps: [
        sienna(`Good. Most people pretend not to be. It wastes everyone's evening.`, 'happy'),
        sienna(`Lunch, then. Not here.`, 'neutral'),
        narrate(`She doesn't look at Noor when she says it. That's how you know she means Noor.`),
      ],
    }),
    option('refuse', `"The hotel isn't for sale."`, {
      effects: [trust('sienna', 3), setFlag('refused_offer')],
      steps: [
        when(
          C.flag('player_leans_sell'),
          [
            sienna(`Really? That's not what you told Vera on the ramp.`, 'flirty'),
            sienna(`Small island. Sound carries over water.`),
            think(`She's been here six hours and she already knows what I said at the harbour.`),
          ],
          [sienna(`Everything's for sale. The only question is whether the price is in money.`, 'neutral')],
        ),
        sienna(`Keep the napkin. Numbers age better than people.`, 'neutral'),
      ],
    }),
    option('flirt', `"Is that the number for the hotel, or for dinner with you?"`, {
      effects: [affinity('sienna', 5), setFlag('flirted_sienna')],
      steps: [
        sienna(`…`, 'surprised'),
        sienna(`Oh, I like you. That's inconvenient.`, 'laughing'),
        sienna(`Dinner's not for sale, {player}. But it is occasionally available.`, 'flirty'),
      ],
    }),
  ]),

  sienna(`I'm at the Anchor. Room four. Not that kind of invitation — that's where the paperwork is.`, 'neutral'),
  narrate(`She leaves a tip larger than her bill and climbs the stairs without looking back. The whole room exhales.`),
  music('low_tide', 2),
  shot('c1_bar_noor_after'),
  noor(`Careful with her.`, 'neutral'),
  me(`You two have history.`),
  noor(`Everyone on this island has history. She's just got more of it than most.`, 'sad'),
  when(C.flag('flirted_sienna'), [
    noor(`And for the record? "Dinner with you?" Smooth. Disgusting. But smooth.`, 'flirty'),
  ]),

  choice('c1_noor_sienna', [
    option('press', `Press her about it.`, {
      effects: [trust('noor', -2), setFlag('pressed_noor')],
      steps: [
        me(`What happened between you two?`),
        noor(`Leave it, okay? Not tonight.`, 'angry'),
        noor(`…Sorry. Not your fault. Long week.`, 'sad'),
        think(`That wasn't about a long week. That was fear, wearing a bar towel.`),
      ],
    }),
    option('let_go', `Let it go. Ask about the piano instead.`, {
      effects: [affinity('noor', 3), trust('noor', 2), setFlag('noor_invited_piano')],
      steps: [
        me(`Who's the sign on the piano for?`),
        noor(`Everyone. Mostly me.`, 'laughing'),
        noor(`I play after closing, sometimes. If you're still awake at one — the side door sticks, but it isn't locked.`, 'flirty'),
      ],
    }),
    option('joke', `"If she's the villain, she has excellent taste in coats."`, {
      effects: [affinity('noor', 2), milestone('noor', 'real_laugh'), setFlag('noor_invited_piano')],
      steps: [
        noor(`She's not a villain. She's worse. She's from here.`, 'laughing'),
        narrate(`And then Noor laughs properly — head back, hand over her mouth, the bar-laugh gone and something younger underneath it.`),
        noor(`Oh, that's the first time I've laughed tonight. Write it down.`, 'happy'),
        noor(`Side door. After one. It sticks, but it isn't locked. Don't make it weird.`, 'flirty'),
      ],
    }),
  ]),

  narrate(`Last orders come and go. You climb the stone steps back up into the sleeping hotel with the taste of salt and orange peel in your mouth.`),
  jump('c1_first_night'),
], { replayable: true });
