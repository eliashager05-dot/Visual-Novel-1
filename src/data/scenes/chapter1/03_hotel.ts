import {
  affinity, bg, C, choice, effects, hide, jump, me, music, narrate, option, scene, setFlag, shot, speaker, think,
  transition, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const bram = speaker('bram');

export const c1Hotel = scene('c1_hotel', 'ch1', 'The Halcyon', [
  hide('*'),
  bg('hotel_exterior_night', 'fade'),
  music('old_rooms', 3),
  shot('c1_hotel_facade'),
  narrate(`The Halcyon sits at the top of the hill as if it is still waiting for 1926 to come back. Four storeys of white stone gone grey, a glass porch, a neon sign with one dead letter: THE HAL YON.`),
  think(`I've mixed records in basements with more structural integrity. But every window on the ground floor is lit, and someone has polished the brass on the door.`),
  shot('c1_hotel_vera_door'),
  vera(`The C fell off in March. We are on a waiting list for a C.`, 'neutral'),

  bg('hotel_lobby_evening'),
  shot('c1_lobby_wide'),
  narrate(`Inside: black-and-white tiles, a staircase that curls up into shadow, armchairs that have outlived several owners. It smells of beeswax and the sea.`),
  vera(`Reception. Lounge. The dining room is through there. The bar is downstairs, with its own entrance, so the guests we do not want can avoid the guests we do.`),
  me(`How many guests do you have?`),
  vera(`This week? Four. A scientist. A retired couple who come every summer to argue. And a man who paid in cash and asked for a room without a sea view.`),
  vera(`In a hotel on a cliff.`, 'neutral'),
  think(`She says it with something very close to affection.`),
  narrate(`At the far end of the lobby, a corridor is closed off with a velvet rope and a hand-lettered sign: EAST WING CLOSED.`),

  choice('c1_hotel_eastwing', [
    option('ask', `Ask about the east wing.`, {
      effects: [setFlag('noticed_east_wing')],
      steps: [
        me(`What's in the east wing?`),
        shot('c1_lobby_vera_close'),
        vera(`Water damage.`, 'neutral'),
        me(`That was fast.`),
        vera(`It was a fast leak.`, 'worried'),
        think(`First lie. I think. She's not good at them, which is either reassuring or very much not.`),
      ],
    }),
    option('leave', `Leave it for now.`, {
      effects: [trust('vera', 1)],
      steps: [
        narrate(`Some doors you knock on later. Vera notices you not asking, and something in her shoulders comes down half an inch.`),
      ],
    }),
  ]),

  shot('c1_lobby_guestbook'),
  narrate(`On the reception desk lies a guest book bound in green leather, open to a page dated in March. The last entry isn't a guest's. The handwriting leans forward, in a hurry.`),
  narrate(`"Gone fishing. Back before the tide turns. Don't wait up, Vera. — M.H."`),
  vera(`Nobody has turned the page since.`, 'sad'),
  vera(`It is a hotel. We should turn the page. I keep meaning to.`),
  think(`She won't, though. I can hear it in how she says it.`),
  vera(`Bram will have kept something warm. He always keeps something warm. It is the only thing he and Margit never argued about.`),

  bg('hotel_kitchen_night'),
  shot('c1_kitchen_bram'),
  narrate(`The kitchen is the only room in the building that looks like it's winning. Copper pans, a range the size of a car, and a broad, grey-bearded man stirring something that smells like the best decision you've made all month.`),
  bram(`So. You're the kid.`, 'neutral'),
  me(`I'm the kid.`),
  bram(`Sit. Eat. Talk after. Dinner's at eight, this is so you don't faint before it.`),
  shot('c1_kitchen_player'),
  narrate(`Fish soup, bread with a crust you could knock on, butter with salt crystals in it. Bram watches you eat the way a mechanic listens to an engine.`),
  shot('c1_kitchen_bram_close'),
  bram(`She talked about you, you know.`, 'sad'),

  choice('c1_bram_margit', [
    option('surprised', `"She did? We met once."`, {
      effects: [affinity('bram', 3), setFlag('bram_shell_story')],
      steps: [
        bram(`Once was enough for her. You gave her back a shell. Said it was too loud to keep.`, 'neutral'),
        bram(`She told that story every Christmas for twenty years.`, 'laughing'),
        think(`I remember the shell. I don't remember giving it back.`),
      ],
    }),
    option('fraud', `"I didn't know her. I feel like a fraud being here."`, {
      effects: [affinity('bram', 2), trust('vera', 2)],
      steps: [
        bram(`Good. Frauds don't say that.`, 'neutral'),
        narrate(`Behind you, Vera has gone very still in the doorway. You didn't hear her come in.`),
        vera(`Nobody here knew her completely. She liked it that way.`, 'sad'),
      ],
    }),
  ]),

  bram(`I'll ask you one thing, kid.`, 'worried'),
  bram(`She took the boat out that night. In weather. Forty years on this island and she never once took the boat out after dark.`),
  bram(`Police say accident. Police are from the mainland.`),
  shot('c1_kitchen_vera_bram'),
  vera(`Bram.`, 'angry'),
  bram(`I'm only saying what everyone's thinking.`, 'neutral'),
  vera(`Everyone is thinking it. Nobody needs to say it on the first night.`, 'angry'),

  choice('c1_hotel_question', [
    option('gentle', `Ask Vera how she's holding up.`, {
      effects: [trust('vera', 4), affinity('vera', 2), setFlag('asked_vera_wellbeing')],
      steps: [
        vera(`I am holding up the building. That is the job.`, 'surprised'),
        vera(`…Thank you for asking. People mostly ask about the money.`, 'embarrassed'),
      ],
    }),
    option('money', `Ask about the hotel's finances.`, {
      effects: [trust('vera', 2), affinity('vera', 1), setFlag('asked_finances')],
      steps: [
        vera(`Tomorrow. With coffee and the actual numbers.`, 'neutral'),
        vera(`If I tell you tonight you will not sleep, and I need at least one of us rested.`),
      ],
    }),
    option('boat', `Ask what happened to the boat.`, {
      effects: [setFlag('asked_about_boat')],
      steps: [
        bram(`Harbour police took it to the mainland. Evidence, they said. Evidence of what, I asked.`, 'angry'),
        vera(`And they did not answer, because there was nothing to answer.`, 'neutral'),
        think(`She says it like she's said it to herself a lot.`),
      ],
    }),
  ]),

  shot('c1_kitchen_key'),
  narrate(`Vera sets a key on the table. Heavy brass, a wooden fob with a number burned into it: 12.`),
  vera(`Room twelve. First floor, sea view, a radiator that sings. It was the room Margit gave to people she liked.`, 'neutral'),
  vera(`Do not read anything into it. It was also the only clean one.`),
  when(C.chose('c1_vera_first', 'dinner'), [
    bram(`Heard you asked her to dinner on the ramp.`, 'laughing'),
    bram(`First time in ten years anyone's made her blush.`),
    vera(`I did not blush. It was windy.`, 'embarrassed'),
    effects(affinity('bram', 1)),
  ]),
  transition('fade', 1),
  jump('c1_corridor'),
], { replayable: true });
