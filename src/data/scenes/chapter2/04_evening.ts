import {
  affinity, bg, C, choice, clock, effects, fx, jump, me, music, narrate, option, phone, scene, setFlag, setVar,
  sfx, shot, speaker, text, think, transition, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const noor = speaker('noor');
const june = speaker('june');
const sienna = speaker('sienna');
const bram = speaker('bram');

const afternoon = (who: string) => C.chose('c2_afternoon', who);
/** Spent time with them today: the afternoon, or the two hours before midnight. */
const spent = (who: string) => C.any(afternoon(who), C.chose('c2_late', who));

// --- Evening: seven plates ----------------------------------------------------
export const c2Evening = scene('c2_evening', 'ch2', 'Seven Plates', [
  bg('hotel_lobby_morning', 'fade'),
  clock('dusk'),
  fx(null),
  music('old_rooms', 3),
  shot('c2_lobby_dusk'),
  narrate(`You come back through the lobby as the light goes. The windows are shut again, the glass swept up. The Halcyon has the stunned, scrubbed look of a building that survived something and hasn't decided how it feels about it yet.`),

  // Whoever you didn't spend the afternoon with has something to say.
  when(C.not(afternoon('noor')), [
    text('noor', `Bar's dry-ish. Free drinks tonight for anyone who carried a bucket. You did not carry a bucket. I'm just saying.`, { quiet: true }),
  ]),
  when(C.not(afternoon('june')), [
    text('june', `Went in at slack water. There's a PIPE. Bronze, 1926, pouring warm water into my cove. Someone is switching it on and off. I'm going to need a ladder and possibly a lawyer.`, { quiet: true }),
  ]),
  when(C.not(afternoon('sienna')), [
    text('sienna', `Car's out. A man with a tractor and no front teeth. I owe him a pint and possibly my soul. Also: my employers are coming on the first ferry. Talk later?`, { quiet: true }),
  ]),
  when(C.not(afternoon('vera')), [
    text('vera', `Leaks in 4, 9 and 22 are under control. The ELIN is not in the boathouse. Again. And Bram is cooking for seven. Again. I am not asking.`, { quiet: true }),
  ]),
  narrate(`Your phone buzzes in your pocket, several times, on the way across the lobby.`),

  // --- Dinner -------------------------------------------------------------------
  bg('hotel_lobby_evening', 'dissolve'),
  clock('evening'),
  shot('c2_dinner_wide'),
  narrate(`Dinner is by the lobby fire, because the dining room is still dripping: six chairs pulled round two card tables, Bram's fish stew, candles out of habit although the power is back.`),
  narrate(`It should feel like a wake. It feels, somehow, like a family meal in a house where nobody quite knows whose house it is.`),
  when(
    C.flag('sienna_warned_aldane'),
    [
      sienna(`You should all know. Aldane are sending a team on the first ferry. Engineers, and a lawyer. They want to find a pump in the cove and switch it off.`, 'worried'),
      june(`They want to WHAT?`, 'angry'),
    ],
    [
      vera(`The ferry office got a message through on the harbour radio. First sailing the day after tomorrow, and a block booking of four seats from Aldane. Engineers.`, 'neutral'),
      june(`Engineers for what? There's nothing to engineer. There's a pipe and my plankton.`, 'angry'),
    ],
  ),
  noor(`Four people in suits on our ferry. Lovely. I'll water the gin.`, 'angry'),
  bram(`You'll do no such thing. I'll do it. I've more experience.`, 'neutral'),
  narrate(`Everyone laughs, a little too loudly, and then everyone looks at you. Fifty-one percent.`),

  choice(
    'c2_dinner',
    [
      option('together', `"Then we meet them together. Whatever's in that cove belongs to this hotel."`, {
        effects: [affinity('vera', 2), affinity('june', 2), affinity('noor', 2), trust('bram', 2), setFlag('rallied_table')],
        steps: [
          vera(`…Yes.`, 'surprised'),
          june(`I'll make slides. Very aggressive slides.`, 'happy'),
          noor(`I'll make cocktails. Very aggressive cocktails.`, 'laughing'),
          when(C.visited('c1_aftermath'), [sienna(`And I'll sit very quietly and pretend I didn't hear any of this.`, 'neutral')]),
        ],
      }),
      option('sienna', `"Sienna, are you with them, or with us?"`, {
        condition: C.visited('c1_aftermath'),
        effects: [setFlag('asked_sienna_side')],
        steps: [
          narrate(`The table goes quiet. Sienna puts her spoon down very precisely, parallel to the edge of her bowl.`),
          when(
            C.any(C.trust('sienna', { gte: 16 }), C.flag('sienna_trusted')),
            [
              sienna(`I'm with whoever's telling me the truth. So far that isn't my employers.`, 'neutral'),
              vera(`…Noted.`, 'surprised'),
              effects(trust('sienna', 2), trust('vera', 1), setFlag('sienna_with_us')),
            ],
            [
              sienna(`I'm with whoever pays me, darling. Same as everyone at this table, if they're honest.`, 'angry'),
              noor(`I'm paid in tips and spite.`, 'neutral'),
              effects(trust('sienna', -1)),
            ],
          ),
        ],
      }),
      option('watch', `Say nothing. Watch the table.`, {
        effects: [setFlag('watched_table')],
        steps: [
          narrate(`So you watch. June eats like someone who has forgotten to for two days. Noor tells a story with her spoon. Vera listens to everything and eats nothing.`),
          narrate(`And Bram doesn't eat at all. He keeps getting up to check the stew he's already checked, and every time he goes, he looks at the clock.`),
          think(`Twice in five minutes. Like a man with somewhere to be.`),
        ],
      }),
    ],
    'Fifty-one percent.',
  ),

  bg('hotel_kitchen_night', 'dissolve'),
  shot('c2_kitchen_bram'),
  narrate(`After dinner you carry the bowls through to the kitchen, the warmest room in the building. Bram is at the range with his back to the door, filling one more bowl from the pot.`),
  narrate(`It doesn't go on the pass with the others. It goes under a steel cover, into a wicker basket by the back door, with a thermos, a paper bag, and a small tin with a picture of a ship on it.`),
  when(C.flag('noor_saw_basket'), [think(`Big man, small basket. Every night since April.`)]),
  when(C.flag('vera_seven_plates'), [think(`Seven since April. We are six.`)]),
  shot('c2_basket'),
  think(`The tin. Captain Black. Cherry.`),

  choice(
    'c2_bram',
    [
      option('ask', `"Who's the seventh plate for, Bram?"`, {
        effects: [affinity('bram', 3), setFlag('bram_told')],
        steps: [
          shot('c2_bram_close'),
          narrate(`He doesn't turn round. He wipes the rim of the last plate with a cloth, slowly, all the way round.`),
          bram(`There's a saying on this island. The sea gives back what it wants to.`, 'neutral'),
          bram(`I've never been sure it's true. I made it up in 1987.`, 'sad'),
          bram(`Kid. Some people go missing because they're lost. And some go missing because they've been found, and they don't want to be.`),
          bram(`Low water's at twenty to midnight tonight. Lowest of the month. If someone were on the cove path at that hour, with a torch, I wouldn't stop them.`, 'neutral'),
          bram(`Don't bring Vera. Not yet. It'll break her heart, and then she'll break mine, and I'm too old for both.`, 'worried'),
        ],
      }),
      option('watch', `Say nothing. Watch where the basket goes.`, {
        effects: [setFlag('followed_bram')],
        steps: [
          narrate(`You sit in the lobby after the others have gone up, with a book you don't read, your back to the wall and your eyes on the corridor.`),
          narrate(`At half past nine, Bram crosses the lobby with the basket on his arm and a torch in his other hand. He unhooks the velvet rope and goes into the east wing.`),
          shot('c2_hatch_night'),
          narrate(`You follow at a distance. From the doorway of the baths you watch him kneel at the hatch, unlock the bright brass padlock, and lift it.`),
          narrate(`Lantern light comes up out of the floor. A hand reaches up out of it and takes the basket. A hand in a yellow sleeve.`),
          narrate(`Bram says something too low to hear. The hatch closes. The lock clicks.`),
          think(`Yellow. Like an oilskin bought in Bergen in 1994.`),
        ],
      }),
      option('help', `Pick up a tea towel and help him wash up.`, {
        effects: [affinity('bram', 2), trust('bram', 2), setFlag('knows_margit_saoirse')],
        steps: [
          narrate(`You dry. He washes. For ten minutes neither of you says a word, and it is the most comfortable silence you've had since the ferry.`),
          bram(`You've the look of her, you know. Margit. Round the eyes. When you're working something out.`, 'neutral'),
          me(`There's a photo over her desk. Her on the ELIN, thirty years ago, with a girl holding a fish.`),
          bram(`Saoirse Marlowe. Best hand on a boat this island ever had, after Margit.`, 'happy'),
          bram(`They were thick as thieves. Then they fell out over the mooring, the way people here fall out: for good, and without saying why. Saoirse went to the mainland. Left the girl with her father.`, 'sad'),
          when(C.visited('c2_sienna_causeway'), [think(`The girl. Sienna, on the Holm, with her hand on the wall.`)]),
          bram(`Margit used to say: the ones you love, you protect by keeping them out of the boat.`, 'neutral'),
          bram(`I always told her that was nonsense. You protect them by letting them row.`),
        ],
      }),
    ],
    'The seventh plate.',
  ),

  // --- Before midnight: two hours, and who to spend them with ---------------------
  clock('night'),
  narrate(`Low water is at twenty to midnight. That leaves two hours of a strange, held-breath evening, and a hotel full of people who are all, in their own way, waiting for something.`),
  choice(
    'c2_late',
    [
      option('vera', `Take two cups of tea up to the terrace, where Vera's lamp is on.`, { goto: { scene: 'c2_late_vera' } }),
      option('noor', `Go down to the bar. Someone is playing the piano, badly, on purpose.`, { goto: { scene: 'c2_late_noor' } }),
      option('june', `Knock on room seven. June's light is still on.`, { goto: { scene: 'c2_late_june' } }),
      option('sienna', `Find Sienna. She was heading for the lounge with a bottle.`, {
        condition: C.visited('c1_aftermath'),
        goto: { scene: 'c2_late_sienna' },
      }),
      option('alone', `Go up to your room and wait.`, {
        steps: [narrate(`You go up to room twelve, put the shell on the windowsill, and watch the tide go out under the moon until your eyes ache.`)],
        goto: { scene: 'c2_message' },
      }),
    ],
    'Before midnight.',
  ),
]);

// --- The message ------------------------------------------------------------------
export const c2Message = scene('c2_message', 'ch2', 'Low Water', [
  clock('night'),
  bg('player_room_night', 'fade'),
  music('mystery', 2),
  shot('c2_room_night_phone'),
  narrate(`Back in room twelve, you don't take your boots off. You sit on the end of the bed and wait for something without knowing what.`),
  sfx('phone_message'),
  text('unknown', `Low water 23:40. The cove path. Bring a torch.`),
  when(
    C.flag('asked_margit_text'),
    [text('unknown', `You asked who this was. Come and see.`)],
    [text('unknown', `Come and see.`)],
  ),
  phone(null),
  think(`Twenty minutes to midnight, at the bottom of a cliff, because a phone told me to. Margit would either be proud of me or furious.`),
  narrate(`You find the torch, and test it. You put on the waxed jacket, and take it off, and put on a jumper under it, and put it back on. You put the shell in your pocket, for no reason you could defend.`),
  narrate(`At twenty past eleven you're standing at the door of room twelve with your hand on the handle.`),

  choice(
    'c2_who_comes',
    [
      option('alone', `Go alone.`, {
        effects: [setFlag('went_alone'), setVar('companion', 'none')],
        steps: [think(`Whoever this is asked for me. Not a search party.`)],
      }),
      option('vera', `Knock on Vera's door.`, {
        condition: C.any(C.trust('vera', { gte: 22 }), spent('vera'), C.flag('vera_saw_photo')),
        showWhenLocked: true,
        lockedHint: `You're not sure she would open the door to you tonight`,
        effects: [setVar('companion', 'vera'), trust('vera', 4)],
        steps: [
          shot('c2_vera_door'),
          narrate(`She opens the door before your second knock, fully dressed, a torch already in her hand.`),
          vera(`I have been sitting here for an hour waiting for a reason. Thank you for being one.`, 'neutral'),
          when(C.flag('bram_told'), [think(`"Don't bring Vera." Sorry, Bram. She has fifty-one percent fewer reasons than me to be kept out of this, and a hundred percent more right.`)]),
        ],
      }),
      option('noor', `Go down to the bar for Noor.`, {
        condition: spent('noor'),
        effects: [setVar('companion', 'noor'), trust('noor', 3)],
        steps: [
          noor(`A midnight walk to a cliff with a man who owns my bar? Absolutely. I'll bring a rope. I'm good with ropes. Ask anyone.`, 'flirty'),
          noor(`…That was a joke. It was a bad joke. I'm nervous.`, 'worried'),
        ],
      }),
      option('june', `Knock on room seven.`, {
        condition: spent('june'),
        effects: [setVar('companion', 'june'), trust('june', 3)],
        steps: [
          june(`Is it about the pipe? It's about the pipe. Give me forty seconds. I need a torch, a thermometer and a better coat.`, 'surprised'),
        ],
      }),
      option('sienna', `Find Sienna.`, {
        condition: spent('sienna'),
        effects: [setVar('companion', 'sienna'), trust('sienna', 3)],
        steps: [
          sienna(`If my employers find out I helped you find their pump before they did, I'll be fired. Slowly. With a PowerPoint.`, 'neutral'),
          sienna(`Give me my coat.`, 'flirty'),
        ],
      }),
    ],
    'Low water, 23:40.',
  ),
  transition('fade', 1.2),
  jump('c2_slack_water'),
]);
