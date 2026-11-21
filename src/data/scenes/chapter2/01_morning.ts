import {
  affinity, bg, C, choice, clock, effects, fx, jump, me, music, narrate, option, phone, rename, reply, scene,
  setFlag, sfx, shot, speaker, text, think, title, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const noor = speaker('noor');
const june = speaker('june');
const sienna = speaker('sienna');
const bram = speaker('bram');

// --- Day three, morning ---------------------------------------------------
export const c2Morning = scene('c2_morning', 'ch2', 'The Morning After', [
  title('Chapter Two', 'Slack Water'),
  bg('player_room_morning', 'fade'),
  clock('morning', 3),
  fx(null),
  music('morning', 3),
  shot('c2_room_morning'),
  narrate(`You wake at nine with your boots still on and your phone still in your hand. Sunlight, of all things. The storm has scrubbed the sky so clean it looks painted on.`),
  narrate(`The photograph is still there when you unlock the screen.`),
  phone('unknown'),
  narrate(`Margit, on the ferry, at 06:12 on the morning you arrived. And under it, four words.`),
  think(`Either my great-aunt is alive, or somebody wants me to believe she is. I honestly can't tell which is worse.`),
  choice(
    'c2_reply',
    [
      option('margit', `"Margit?"`, {
        effects: [setFlag('asked_margit_text')],
        steps: [
          reply('unknown', `Margit?`),
          narrate(`Delivered. Then, under it, three small dots appear: someone typing.`),
          narrate(`They pulse for a long time. Then they stop, and nothing comes.`),
          think(`Somebody started to answer that. And thought better of it.`),
        ],
      }),
      option('who', `"Who is this?"`, {
        steps: [
          reply('unknown', `Who is this?`),
          narrate(`Delivered. Not read. You watch it not being read for longer than you would admit to anyone.`),
        ],
      }),
      option('none', `Don't reply. Not yet.`, {
        effects: [setFlag('photo_unanswered')],
        steps: [
          think(`Whoever this is wants a reaction. Nine years at a mixing desk taught me one thing: when you don't know what the problem is, stop touching the faders.`),
        ],
      }),
    ],
    'The unknown number.',
  ),
  text('ferry', `HALCYON FERRIES: All sailings cancelled until further notice following storm damage to the mainland pier. We apologise for any inconvenience.`, { quiet: true }),
  when(C.visited('c1_morning'), [
    narrate(`Further down, yesterday's thread from another unknown number. Lunch? I'll drive. Wear shoes you can walk in. You finally save it under her name.`),
    rename('sienna', null),
  ]),
  phone(null),
  think(`No ferry. So whoever was on that photograph is on this island, and so am I, and neither of us is going anywhere.`),
  when(
    C.not(C.flag('read_letter')),
    [
      shot('c2_letter_morning'),
      narrate(`On the desk lies the solicitor's envelope, and inside it the smaller one you still haven't opened. Margit's handwriting: For when you arrive. Not before.`),
      think(`I've arrived. I've arrived about as much as a person can.`),
      narrate(`Wax seal. One sheet. Fountain pen, the handwriting leaning forward as if it was in a hurry.`),
      narrate(`"If you're reading this, I didn't come back. I'm sorry about that, and about the paperwork. I left the Halcyon to you because you listen, and on this island people only ever talk."`),
      narrate(`"The hotel isn't the inheritance. Look under the tide. Trust Vera, even when she doesn't trust you. Bram knows more than he says. And whatever Aldane offers, ask them why. — M."`),
      narrate(`Something slides out of the envelope into your palm: a small, pale spiral shell, polished smooth by years of handling.`),
      think(`The shell I gave her when I was six. She kept it twenty years. And she wrote "if I didn't come back" — not "when I'm gone".`),
      effects(setFlag('read_letter'), setFlag('has_shell')),
    ],
    [
      narrate(`Margit's shell is on the nightstand where you left it. You put it in your pocket without quite deciding to.`),
      think(`Look under the tide, she wrote. I'm starting to think she meant it literally.`),
    ],
  ),

  // --- The lobby ----------------------------------------------------------
  bg('hotel_lobby_morning', 'dissolve'),
  music('old_rooms', 2),
  shot('c2_lobby_morning'),
  narrate(`Downstairs, the Halcyon looks like it lost a fight and won on points. Leaves and broken glass across the chequered tiles, the porch boarded up with a door from somewhere else, every window open to let the damp out.`),
  shot('c2_bram_sweeping'),
  bram(`Morning, kid. Mind the glass. Mind the bucket. Mind the other bucket.`, 'neutral'),
  me(`How bad is it?`),
  bram(`Causeway's gone. Ferry's off. Phone lines are down till someone on the mainland remembers we exist. Nobody comes, nobody goes.`, 'neutral'),
  bram(`Suits some.`, 'neutral'),
  think(`He doesn't say who it suits. He sweeps a little harder.`),
  narrate(`On the reception desk, someone has put a jam jar of sea pinks in front of a small framed photograph of Margit, as if the storm needed apologising for.`),
  bram(`Vera does the flowers. Every Monday since the memorial. Don't mention it.`, 'sad'),
  me(`When was the memorial?`),
  bram(`May. Empty coffin. Vera chose the hymns, I made the soup. Half the island came, and the other half sent apologies and came anyway.`, 'neutral'),
  bram(`Margit would've hated every minute. Specially the soup.`, 'sad'),

  shot('c2_vera_desk_morning'),
  when(
    C.flag('vera_has_ledger'),
    [
      narrate(`Vera is at reception in yesterday's clothes with Margit's ledger open in front of her, a pencil behind her ear and another in her hand. She hasn't slept. She has annotated it.`),
      vera(`I have been through every page. Twice.`, 'neutral'),
      vera(`I will tell you what I found. Not in front of the guests.`, 'worried'),
    ],
    [narrate(`Vera is at reception in yesterday's clothes, holding a phone that doesn't work and writing a list on the back of a menu.`)],
  ),
  when(C.flag('vera_moment'), [
    narrate(`She looks up when you come in, and for a second neither of you knows what to do with your face.`),
    vera(`Good morning, {player}.`, 'embarrassed'),
    vera(`About last night. On the slipway.`, 'embarrassed'),
    me(`"One more second"?`),
    vera(`…I was going to say "thank you for not letting me fall". But yes. That.`, 'happy'),
    effects(affinity('vera', 2)),
  ]),
  when(C.all(C.flag('took_key_alone'), C.not(C.flag('vera_moment'))), [
    vera(`I see you found your own way into Margit's room last night.`, 'angry'),
    vera(`Next time, ask. It is the least you can do with a key that is not yours.`, 'angry'),
  ]),

  choice(
    'c2_photo',
    [
      option('vera', `Show Vera the photograph.`, {
        effects: [trust('vera', 4), affinity('vera', 2), setFlag('vera_saw_photo')],
        steps: [
          shot('c2_vera_photo'),
          narrate(`You put the phone on the desk between you. She looks at it for a long time without touching it.`),
          vera(`That is her oilskin. She bought it in Bergen in 1994 and has refused to replace it ever since.`, 'worried'),
          vera(`06:12. That is the first sailing from the mainland.`),
          vera(`She was on the ferry. The morning you came. And she did not come home.`, 'sad'),
          me(`Maybe she couldn't.`),
          vera(`Or maybe she did come home, and did not come to me.`, 'angry'),
          narrate(`She turns the phone face down, very gently, as if it might wake up.`),
          when(
            C.variable('hotel_stance', { eq: 'together' }),
            [vera(`We said together. So. Together.`, 'neutral')],
            [vera(`Thank you for showing me. You did not have to.`, 'neutral')],
          ),
        ],
      }),
      option('all', `Show everyone at breakfast.`, {
        effects: [setFlag('showed_photo_all'), trust('vera', -1), trust('june', 2)],
        steps: [
          shot('c2_breakfast_photo'),
          narrate(`Breakfast is served on two card tables pushed together in the lobby, because the dining-room ceiling is still dripping. You put the phone in the middle, next to the toast.`),
          narrate(`Bram is pouring tea. He sees the screen and the teapot stops in mid-air. Then he puts it down very carefully and goes back into the kitchen without a word.`),
          june(`Metadata can be faked. Faces can be faked. But that's the right ferry. I've sat under that clock eleven times, and it's always four minutes fast.`, 'neutral'),
          vera(`You might have shown me first.`, 'sad'),
          narrate(`She says it quietly, and then she goes and stands at the window with her back to the room.`),
          effects(setFlag('bram_left_table')),
        ],
      }),
      option('keep', `Keep it to yourself for now.`, {
        effects: [setFlag('photo_secret')],
        steps: [
          think(`Stop looking. Fine. I'll look quietly.`),
          narrate(`You put the phone in your pocket. It feels heavier than a phone.`),
        ],
      }),
    ],
    'The photograph.',
  ),

  shot('c2_june_morning'),
  narrate(`June comes down the stairs two at a time with her laptop open, already talking.`),
  june(`Good, you're up. The mooring sensor survived. It's still reading warm. Not storm warm. Warm warm. Fourteen degrees in nine-degree water.`, 'surprised'),
  june(`Slack water is at ten to three. The tide stops, the silt settles and for twenty minutes I can actually see what's down there. I'm going in.`, 'happy'),
  when(C.flag('june_knows_boat'), [june(`And if a blue boat turns out to be involved, I'd like it on record that I said so first.`, 'flirty')]),

  when(
    C.visited('c1_aftermath'),
    [
      shot('c2_sienna_morning'),
      narrate(`Sienna Marlowe comes down last, in a fisherman's jumper that reaches her knees over her own silk blouse. She looks like a very expensive shipwreck.`),
      sienna(`Bram lent me this. I think it's older than me. It might be older than the hotel.`, 'embarrassed'),
      sienna(`My car is still nose-down at the causeway with my entire life in the boot. If anyone feels like being a hero this afternoon, I'll be the woman on the bollard, swearing.`, 'flirty'),
    ],
    [
      narrate(`Through the open porch you can see, far off where the road meets the causeway, a dark car nose-down in a ditch and a woman in a camel coat sitting on a bollard beside it.`),
      think(`Sienna Marlowe. She must have slept in that car.`),
    ],
  ),

  // --- Breakfast --------------------------------------------------------------
  shot('c2_breakfast_wide'),
  narrate(`Breakfast happens anyway, because Bram does not recognise storms as a reason to stop breakfast. Two card tables in the lobby, a heap of eggs, a pot of tea the colour of creosote.`),
  bram(`Eggs. There's no bread till the ferry runs. There's no ferry. Eat the eggs.`, 'neutral'),
  narrate(`Noor comes up from the bar in green wellies, carrying a bucket like a handbag.`),
  noor(`The Low Tide is now the Lower Tide. If anyone wants a drink today, bring a snorkel.`, 'neutral'),
  when(C.visited('c1_aftermath'), [
    sienna(`So we're trapped on an island with no phones and no way off. I've seen this film. Someone dies in the library.`, 'flirty'),
    vera(`We do not have a library.`, 'neutral'),
    sienna(`Then we're probably fine.`, 'happy'),
  ]),
  june(`Statistically, the most dangerous thing on this island is Bram's tea.`, 'neutral'),
  bram(`Statistically, the second most dangerous thing is insulting it.`, 'neutral'),

  choice(
    'c2_breakfast',
    [
      option('ferry', `"How long until the ferry runs again?"`, {
        effects: [trust('vera', 2), setFlag('asked_ferry_time')],
        steps: [
          vera(`Two days, if the mainland pier is only damaged. Two weeks if it is gone.`, 'neutral'),
          vera(`The bank's ninety days do not stop for weather, in case you were wondering. I asked them once. They laughed for a long time.`, 'worried'),
          think(`Ninety days. Eighty-eight, now. A hotel nobody can leave, a debt nobody can pay, and a great-aunt nobody can bury.`),
        ],
      }),
      option('aldane', `"Sienna, what will your employers do now?"`, {
        condition: C.visited('c1_aftermath'),
        effects: [trust('sienna', -1), affinity('vera', 2), setFlag('asked_sienna_at_table')],
        steps: [
          narrate(`The table goes quiet. Even Bram stops chewing.`),
          sienna(`Wait for the ferry, same as us. Send someone with a better coat than mine.`, 'neutral'),
          sienna(`And for the record, I'd rather not be cross-examined over eggs. It's bad for the digestion and worse for negotiations.`, 'angry'),
          vera(`Then perhaps negotiate somewhere else.`, 'angry'),
          noor(`Ooh.`, 'laughing'),
        ],
      }),
      option('eggs', `"These are the best eggs I've ever had, Bram."`, {
        effects: [affinity('bram', 3), affinity('noor', 1), setFlag('praised_eggs')],
        steps: [
          bram(`…`, 'surprised'),
          bram(`Butter. And patience. Nobody's got patience any more.`, 'happy'),
          noor(`He's going to make them every day now, you know. You've doomed us all to eggs.`, 'laughing'),
          bram(`Kid's got taste. Rare in an owner.`, 'happy'),
        ],
      }),
    ],
    'Breakfast.',
  ),
  narrate(`Noor takes her bucket back down to the lake. June takes her laptop back up to the stairs. The table breaks up the way tables do, a little at a time.`),
  when(C.flag('vera_has_ledger'), [
    narrate(`Vera waits until the lobby is empty, then turns the ledger round so you can read her pencil notes in the margins.`),
    vera(`Six hundred a month to N.H., since February. Twelve hundred to J.C., since January. And the March payment to S.M.: more than the hotel made all last year.`, 'neutral'),
    vera(`She took it from the baths fund. The money her grandfather left to reopen the east wing. Forty years she would not touch it, not for the roof, not for my wages when we were short.`, 'worried'),
    vera(`Whatever she bought with it, she thought it mattered more than the baths. That frightens me more than anything else in this book.`, 'sad'),
  ]),
  when(C.flag('has_ledger'), [
    narrate(`Margit's ledger is still in the inside pocket of your jacket. You can feel the corner of it against your ribs, like a hand.`),
  ]),

  shot('c2_vera_keys'),
  sfx('key_turn'),
  vera(`The storm took half the glass roof off the east wing. There is water coming through the ceiling of room fourteen.`, 'neutral'),
  vera(`Nobody has been in that wing for twelve years. I need to see the damage, and I would like a witness who owns fifty-one percent of it.`, 'neutral'),
  when(C.flag('noticed_east_wing'), [think(`The velvet rope I noticed on the first night. EAST WING CLOSED. Finally.`)]),
  jump('c2_east_wing'),
]);
