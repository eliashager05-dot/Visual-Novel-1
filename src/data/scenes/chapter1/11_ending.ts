import {
  bg, C, cg, choice, clock, effects, end, fx, jump, me, music, narrate, option, phone, photo, scene, setFlag,
  sfx, shot, speaker, text, think, title, transition, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');

// --- Margit's room -------------------------------------------------------
export const c1MargitRoom = scene('c1_margit_room', 'ch1', "Margit's Room", [
  bg('hotel_corridor_night', 'fade'),
  clock('late'),
  fx({ flicker: 'candle' }),
  music('mystery', 3),
  when(
    C.trust('vera', { gte: 18 }),
    [
      shot('c1_vera_key'),
      narrate(`Vera is waiting at the end of the second-floor corridor, outside a door with no number on it, a candle in one hand and a key in the other.`),
      vera(`I have not opened this door since March.`, 'neutral'),
      vera(`I would like to not do it alone.`, 'sad'),
      effects(setFlag('vera_invited_room'), trust('vera', 2)),
    ],
    [
      shot('c1_desk_key'),
      narrate(`On your way up you pass reception. The key cabinet is open, and a heavy brass key hangs on the hook marked M.H.`),
      narrate(`Vera is asleep in the armchair behind the desk, a guttering candle beside her, a ledger rising and falling on her chest.`),
      choice('c1_take_key', [
        option('take', `Take the key.`, {
          effects: [setFlag('took_key_alone'), trust('vera', -3)],
          steps: [narrate(`It's heavier than it looks. Everything in this building is.`)],
        }),
        option('wake', `Wake Vera and ask her.`, {
          effects: [trust('vera', 3), setFlag('vera_invited_room')],
          steps: [
            vera(`…What time is it?`, 'worried'),
            me(`Late. I want to see Margit's room.`),
            vera(`So do I. I have been too much of a coward to.`, 'sad'),
            vera(`Come on.`, 'neutral'),
          ],
        }),
      ]),
    ],
  ),

  bg('margit_room_night'),
  fx({ flicker: 'candle', dust: true }),
  sfx('key_turn'),
  shot('c1_margit_room_wide'),
  narrate(`Margit's room smells of lavender and cold pipe tobacco. Books in three languages. A barometer stuck on CHANGE. And under the window, a desk covered in everything she didn't tell anyone.`),
  narrate(`Charts of the cove. Dozens of them, hand-drawn, with depth soundings in pencil. One spot circled again and again until the paper wore thin: the old mooring.`),
  when(C.flag('june_mooring_hint'), [think(`The old mooring. Where June said the glow is brightest.`)]),
  when(C.any(C.flag('june_manmade_theory'), C.flag('felt_vibration')), [think(`A pipe. A cable. A machine.`)]),
  shot('c1_margit_photo_wall'),
  narrate(`Pinned above the desk is a faded photograph: a much younger Margit on the deck of the ELIN, laughing into the wind, and beside her a young woman of about twenty, one arm around Margit's shoulders, holding up a fish as long as her arm.`),
  when(
    C.flag('vera_invited_room'),
    [
      vera(`That is not me. That photograph is thirty years old.`, 'worried'),
      vera(`I do not know who that is. Margit never once mentioned her.`),
    ],
    [think(`A young woman, thirty years ago. She'd be about fifty now. Nobody on this island has mentioned her.`)],
  ),

  shot('c1_margit_ledger'),
  narrate(`In the desk drawer, a ledger of her own. Neat columns. Payments out, every month since February.`),
  narrate(`"N.H. — 600." "J.C. — 1,200." And one large payment in March, three days before she disappeared: "S.M. — final. Paid in full."`),
  when(C.flag('saw_payments'), [think(`"Under the tide." The account in Vera's books. This is where the money went.`)]),
  think(`N.H. — Noor Haddad. J.C. — Juniper Castell. S.M. …Sienna Marlowe? But Sienna said her father's debts were paid years ago. Not in March.`),
  when(
    C.flag('vera_invited_room'),
    [
      vera(`She was paying them. All of them. And she did not tell me.`, 'angry'),
      vera(`Why did she not tell me?`, 'sad'),
      me(`Maybe she was protecting you.`),
      vera(`From what?`, 'worried'),
    ],
    [think(`Vera doesn't know about this. Or she does, and that's worse.`)],
  ),
  effects(setFlag('found_margit_ledger')),

  choice(
    'c1_ledger',
    [
      option('take', `Take the ledger with you.`, { effects: [setFlag('has_ledger')] }),
      option('vera', `Give the ledger to Vera.`, {
        condition: C.flag('vera_invited_room'),
        effects: [trust('vera', 5), setFlag('vera_has_ledger')],
        steps: [
          vera(`…You are giving this to me?`, 'surprised'),
          me(`It's her handwriting. You'll read it better than I will.`),
          vera(`Thank you. I mean that.`, 'sad'),
        ],
      }),
      option('leave', `Leave it where it is, and remember.`, { effects: [setFlag('ledger_left')] }),
    ],
    'The ledger.',
  ),
  transition('fade', 1.2),
  jump('c1_cliffhanger'),
], { replayable: true });

// --- Cliffhanger ---------------------------------------------------------
export const c1Cliffhanger = scene('c1_cliffhanger', 'ch1', 'Stop Looking', [
  bg('player_room_night', 'fade'),
  clock('dawn'),
  fx(null),
  music(null, 3),
  shot('c1_room_dawn'),
  narrate(`It's nearly four when you get back to room twelve. The storm has blown itself out. The sea is quiet, the radiator is quiet, and the whole building seems to be holding its breath.`),
  when(C.flag('has_shell'), [narrate(`You set Margit's shell on the nightstand.`)]),
  think(`Ninety days. A boat that came back from the mainland on its own. A ledger full of initials. A room nobody was allowed into. And everyone on this island lying to me, a little, out of love.`),
  when(
    C.flag('vera_moment'),
    [think(`And Vera, on a slipway in the dark, saying "one more second". I keep coming back to that one.`)],
    [think(`I came here to sign some papers and leave. I don't think I'm leaving.`)],
  ),
  narrate(`You lie down without undressing. Outside, a gull tries out the first note of the morning, decides against it.`),
  sfx('phone_message'),
  narrate(`Your phone lights up on the nightstand.`),
  shot('c1_cliff_player'),
  photo('unknown', 'cg_margit_photo'),
  narrate(`Unknown number. No text. Just a photograph.`),
  phone(null),
  cg('cg_margit_photo'),
  narrate(`The ferry deck. The same rail you leaned on yesterday. A woman in a yellow oilskin, grey hair whipping in the wind, looking straight into the camera.`),
  narrate(`Margit.`),
  narrate(`Behind her, the digital clock on the passenger-lounge wall shows a date and a time. Yesterday's date. 06:12.`),
  think(`The first sailing of the day. The crossing before mine.`),
  cg(null),
  sfx('phone_message'),
  narrate(`A second message arrives while you're still staring at the first. Four words.`),
  text('unknown', `Stop looking. Don't sell.`),
  transition('black', 2),
  phone(null),
  title('End of Chapter One', 'Low Tide'),
  end({ chapterComplete: true, nextChapter: 'ch2' }),
], { replayable: true });
