import {
  affinity, bg, C, choice, fx, jump, me, music, narrate, option, scene, setFlag, shot, speaker, transition, trust,
  when,
} from '../../story/dsl';

const vera = speaker('vera');
const noor = speaker('noor');
const june = speaker('june');
const sienna = speaker('sienna');

// --- Vera: the terrace ------------------------------------------------------------
export const c2LateVera = scene('c2_late_vera', 'ch2', 'The Terrace', [
  bg('hotel_terrace_night', 'fade'),
  fx(null),
  music('night_audit', 3),
  shot('c2_terrace_vera'),
  narrate(`Vera has carried the reception lamp out onto the terrace on its long cable and is doing the accounts at a wrought-iron table, in a coat, at ten o'clock at night, in August, on a cliff.`),
  vera(`The office smells of wet carpet. The terrace smells of the sea. I chose the sea.`, 'neutral'),
  narrate(`You put a cup of tea next to the ledger. She looks at it as if nobody has ever done that before, which may be true.`),
  when(C.milestone('vera', 'missing_c'), [
    narrate(`Above you, the sign is still lit: THE HALCYON in full, pink light on the wet flagstones and on her face.`),
    vera(`I keep coming out to check it is still on. Like a child with a night light.`, 'embarrassed'),
  ]),
  vera(`I am afraid of what is under that floor, {player}.`, 'worried'),
  vera(`If it is nothing, I will feel stupid. If it is her, I do not know what I will feel. I have never not known what I feel. It is very unpleasant.`, 'sad'),
  choice(
    'c2_late_vera_choice',
    [
      option('quiet', `Sit with her and say nothing.`, {
        effects: [affinity('vera', 3)],
        steps: [
          narrate(`You sit. She does the accounts. The sea does what it does at the foot of the cliff. After a while she stops writing and just holds the cup.`),
          vera(`Thank you for not saying something wise.`, 'happy'),
        ],
      }),
      option('together', `"Whatever's down there, you won't find it alone."`, {
        effects: [trust('vera', 4), setFlag('promised_vera_tonight')],
        steps: [
          vera(`…Is that a promise, or something people say on terraces?`, 'surprised'),
          me(`It's a promise. I've never made one on a terrace before, so I can't compare.`),
          vera(`Then I will hold you to it. I hold everyone to everything. It is my worst quality and my best one.`, 'neutral'),
        ],
      }),
      option('hand', `"May I?" Hold out your hand.`, {
        condition: C.affinity('vera', { gte: 35 }),
        showWhenLocked: true,
        lockedHint: `Not yet. Not with her`,
        effects: [affinity('vera', 5), setFlag('held_vera_hand')],
        steps: [
          narrate(`She looks at your hand for so long you start to take it back. Then she puts the cup down and puts hers in it.`),
          narrate(`Her fingers are cold from the night and the pen. She doesn't let go, and she doesn't look at you, and she goes on reading the column of numbers with her other hand as if nothing at all is happening.`),
          vera(`The figures for June are wrong. I will fix them tomorrow.`, 'embarrassed'),
          vera(`…Do not move.`, 'embarrassed'),
        ],
      }),
    ],
    'Vera.',
  ),
  transition('fade', 1),
  jump('c2_message'),
], { replayable: true });

// --- Noor: wrong notes --------------------------------------------------------------
export const c2LateNoor = scene('c2_late_noor', 'ch2', 'Wrong Notes', [
  bg('low_tide_bar_closed', 'fade'),
  fx(null),
  music('night_piano', 3),
  shot('c2_bar_piano_night'),
  narrate(`The bar is dry now, more or less, and dark except for the fairy lights and one lamp on the piano. Noor is playing it. Badly. On purpose: the same three wrong notes, over and over, very loudly.`),
  noor(`I'm annoying the ghost. Margit hated this chord. If she's haunting the place, she'll come down and tell me off.`, 'laughing'),
  noor(`…She hasn't. I've been playing it for forty minutes.`, 'sad'),
  narrate(`She stops. The silence afterwards is huge.`),
  noor(`Can I tell you the thing I didn't tell anyone? About March?`, 'worried'),
  noor(`When I tied the ropes for her that night, she hugged me. Margit didn't hug. She shook your hand like she was checking it for weapons.`),
  noor(`She hugged me, and she said: "Look after the boy when he comes." I didn't know what boy. I thought she meant a dog.`, 'sad'),
  narrate(`She looks at you over the top of the piano.`),
  noor(`It was you. She knew you'd come before you did.`),
  choice(
    'c2_late_noor_choice',
    [
      option('play', `Sit down next to her and play the right chord.`, {
        effects: [affinity('noor', 4), setFlag('played_with_noor')],
        steps: [
          narrate(`You sit on the end of the stool and put your hands over hers and move one finger, one key to the left. The chord resolves.`),
          noor(`Oh, that's much worse. That's lovely. I hate it.`, 'laughing'),
          narrate(`She plays it again. And again. Softer each time.`),
        ],
      }),
      option('look', `"Then you've done a good job of looking after me."`, {
        effects: [trust('noor', 4)],
        steps: [
          noor(`I've given you three drinks and a bucket. That's not looking after. That's hospitality.`, 'embarrassed'),
          noor(`…But I'll take it. Nobody tells me I've done a good job. They tell me I've done a fast one.`, 'happy'),
        ],
      }),
    ],
    'Noor.',
  ),
  when(C.flag('kissed_noor'), [
    noor(`And about this afternoon. I'm not sorry. I want that on the record as well. The record's getting very long.`, 'flirty'),
  ]),
  transition('fade', 1),
  jump('c2_message'),
], { replayable: true });

// --- June: room seven ---------------------------------------------------------------
export const c2LateJune = scene('c2_late_june', 'ch2', 'Room Seven', [
  bg('player_room_night', 'fade'),
  fx(null),
  music('bloom', 3),
  shot('c2_june_room'),
  narrate(`Room seven is the same shape as yours, and nothing else about it is the same. Every wall is covered in printed graphs held up with surgical tape. There are sample jars on the radiator. There is a wetsuit drying on the wardrobe door like a second, flatter June.`),
  june(`Don't touch the jars. Some of them are lunch.`, 'neutral'),
  shot('c2_june_graph'),
  june(`Look. Five months of the mooring sensor, one line per night. Every night the temperature jumps two hours before low water and drops two hours after. Like clockwork. Like somebody's clock.`, 'surprised'),
  june(`Low water's at twenty to midnight tonight. So it'll switch on at about twenty to ten.`, 'neutral'),
  narrate(`She looks at her watch. It's twenty-five to ten. Neither of you says anything for five minutes.`),
  narrate(`At nine thirty-nine, the line on her laptop jumps.`),
  june(`There. Someone just switched it on. Right now. Under our feet.`, 'worried'),
  when(C.flag('june_plumber_joke'), [june(`I don't suppose you're actually a plumber? It would really help right now.`, 'flirty')]),
  choice(
    'c2_late_june_choice',
    [
      option('go', `"Then we should be there when it's running."`, {
        effects: [trust('june', 3), setFlag('june_plans_cove')],
        steps: [
          june(`Yes. Yes. Science is mostly being in the right place with a thermometer.`, 'happy'),
          june(`And a torch. And someone who isn't me, in case I fall off something.`, 'neutral'),
        ],
      }),
      option('rest', `"You've been cold all day. Sit down for ten minutes."`, {
        effects: [affinity('june', 4)],
        steps: [
          narrate(`She sits on the end of the bed because there is nowhere else to sit. After a moment she leans sideways until her head is on your shoulder.`),
          june(`Ten minutes. For scientific reasons. I'm measuring how warm you are.`, 'embarrassed'),
          june(`Very. You're very warm. That's the finding.`, 'happy'),
        ],
      }),
    ],
    'June.',
  ),
  transition('fade', 1),
  jump('c2_message'),
], { replayable: true });

// --- Sienna: the lounge ------------------------------------------------------------
export const c2LateSienna = scene('c2_late_sienna', 'ch2', 'The Lounge', [
  bg('hotel_lobby_late', 'fade'),
  fx(null),
  music('sienna_theme', 3),
  shot('c2_lounge_sienna'),
  narrate(`The lounge off the lobby is dark except for the fire. Sienna is on the sofa she slept on, or nearly slept on, with her feet tucked under Bram's jumper and a bottle of Noor's worst red on the floor.`),
  sienna(`It's terrible. Have some. Misery loves company, and this wine loves misery.`, 'flirty'),
  narrate(`She pours you a glass into a tooth mug.`),
  sienna(`When the phones come back I'm supposed to send a report. "Site status. Obstacles. Recommended approach."`, 'neutral'),
  sienna(`The obstacles are a bar owner with a grudge, a scientist with a pipe, a manager who'd die before she sold, and you.`),
  sienna(`The recommended approach is that I resign and go and live in a roofless cottage with no plumbing.`, 'laughing'),
  when(C.milestone('sienna', 'saoirse'), [
    sienna(`I keep thinking about Mam. Selling the licence to Margit, of all people. They hadn't spoken in thirty years.`, 'sad'),
    sienna(`You don't sell the only thing you've got left to someone you hate. You sell it to someone you trust.`),
  ]),
  choice(
    'c2_late_sienna_choice',
    [
      option('call', `"Call her. When the phones come back."`, {
        effects: [affinity('sienna', 4), setFlag('sienna_will_call_mother')],
        steps: [
          sienna(`My mother? I haven't called her since I was nineteen. She sends a card at Christmas with no return address.`, 'surprised'),
          sienna(`…Margit would have the number. Margit seems to have had everyone's number.`, 'sad'),
          sienna(`Maybe. Don't make me promise. I'm a terrible promiser. Ask my ex-husband.`, 'neutral'),
        ],
      }),
      option('stay', `Sit down and drink the terrible wine with her.`, {
        effects: [affinity('sienna', 3), trust('sienna', 2)],
        steps: [
          narrate(`You sit. It's even worse than she said. You drink it anyway, and the fire settles, and for half an hour nobody in the room is working for anyone.`),
          sienna(`This is nice. I don't know what to do with nice. I usually invoice it.`, 'embarrassed'),
        ],
      }),
      option('report', `"What will you put in the report?"`, {
        effects: [trust('sienna', 1), setFlag('asked_about_report')],
        steps: [
          sienna(`Honestly? "Site status: complicated." It's the first true thing I'll have written for them.`, 'neutral'),
          sienna(`They'll fire me. Or promote me. With Aldane it's sometimes hard to tell the difference.`, 'laughing'),
        ],
      }),
    ],
    'Sienna.',
  ),
  transition('fade', 1),
  jump('c2_message'),
], { replayable: true });
