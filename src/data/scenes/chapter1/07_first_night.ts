import {
  affinity, bg, C, cg, choice, effects, fx, jump, me, milestone, music, narrate, option, phone, reply, scene,
  setFlag, sfx, shot, speaker, text, think, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const noor = speaker('noor');
const june = speaker('june');

// --- The hub -------------------------------------------------------------
export const c1FirstNight = scene('c1_first_night', 'ch1', 'The First Night', [
  bg('player_room_night', 'fade'),
  music('mystery', 3),
  shot('c1_room_window'),
  narrate(`Midnight. The radiator sings its B-flat. Below the window, the sea breathes in and out against the cliff.`),
  think(`I've slept in studios, airport floors, a van in a car park in the rain. Apparently I can't sleep in a brass bed with a sea view.`),
  narrate(`On the desk lies the solicitor's envelope. Inside it, under the copies of the will, is a smaller envelope you haven't opened. Margit's handwriting: For when you arrive. Not before.`),
  narrate(`Out of the window, down at the cove, a single light moves slowly along the waterline.`),
  when(C.flag('noor_invited_piano'), [
    sfx('phone_message'),
    text('noor', `Got your number from the hotel register. Very unprofessional of me.`),
    text('noor', `Side door. It sticks. Not a big deal either way.`),
    choice('c1_noor_text', [
      option('tempting', `"Tempting."`, {
        effects: [affinity('noor', 2)],
        steps: [reply('noor', `Tempting.`), text('noor', `That's the spirit. Or the gin. One of the two.`)],
      }),
      option('tired', `"Long day. We'll see."`, {
        steps: [reply('noor', `Long day. We'll see.`), text('noor', `Honest. Annoying, but honest.`)],
      }),
    ]),
    phone(null),
  ]),

  choice(
    'c1_night_choice',
    [
      option('lobby', `Go down to the lobby. There's a lamp on at reception.`, { goto: { scene: 'c1_night_vera' } }),
      option('bar', `Go down to the bar. Noor said she plays after closing.`, {
        condition: C.any(C.flag('noor_invited_piano'), C.affinity('noor', { gte: 30 })),
        showWhenLocked: true,
        lockedHint: `The bar's side door is locked tonight`,
        goto: { scene: 'c1_night_noor' },
      }),
      option('cove', `Go down to the cove, toward the light.`, { goto: { scene: 'c1_night_june' } }),
      option('letter', `Stay in and open Margit's letter.`, { goto: { scene: 'c1_night_letter' } }),
    ],
    'Where do you go?',
  ),
]);

// --- Vera: the night audit ----------------------------------------------
export const c1NightVera = scene('c1_night_vera', 'ch1', 'Night Audit', [
  bg('hotel_lobby_late', 'dissolve'),
  fx({ flicker: 'lamp' }),
  music('night_audit', 2),
  shot('c1_vera_desk_wide'),
  narrate(`The lobby is dark except for a green-shaded lamp at reception. Vera is behind the desk in a grey cardigan, hair half down, reading glasses on, walled in by ledgers.`),
  narrate(`She hears you on the stairs and takes the glasses off before she looks up.`),
  shot('c1_vera_desk_close'),
  vera(`You should be asleep.`, 'neutral'),
  me(`So should you.`),
  vera(`I am doing the night audit. Someone has to.`),
  me(`Who did it before?`),
  vera(`…Margit. With a glass of rum and the radio on. She said numbers were easier with music.`, 'sad'),
  narrate(`There's no music now. Just the clock above the pigeonholes, ticking.`),

  choice('c1_vera_night', [
    option('help', `Offer to help with the books.`, {
      effects: [trust('vera', 4), affinity('vera', 3), setFlag('helped_vera_audit')],
      steps: [
        vera(`Can you read a ledger?`, 'surprised'),
        me(`I can read a mixing desk with ninety-six channels. How different can it be?`),
        vera(`Very. Sit.`, 'happy'),
        cg('cg_vera_ledgers'),
        narrate(`For an hour you work in a silence that slowly stops being awkward. You add columns. She checks them. You're slow. You're not wrong.`),
        narrate(`At one point she reaches past you for a pencil, and neither of you mentions how close that is.`),
        cg(null),
      ],
    }),
    option('takeover', `Tell her to go to bed. You'll watch the desk.`, {
      effects: [trust('vera', 5), affinity('vera', 2), milestone('vera', 'night_shift'), setFlag('vera_slept')],
      steps: [
        vera(`You do not know how anything works.`, 'angry'),
        me(`Then nothing will happen and I'll have nothing to do. Go to bed, Vera.`),
        narrate(`A long pause. You can actually watch her calculate it.`),
        vera(`If the phone rings, write down the name. If anyone wants a room, the answer is yes. If the building catches fire, wake Bram, then me.`, 'worried'),
        vera(`In that order. He is faster on the stairs.`, 'embarrassed'),
        narrate(`She goes. At the foot of the staircase she stops, as if she's about to say something, and doesn't.`),
      ],
    }),
    option('radio', `Switch on the old radio behind the desk.`, {
      effects: [affinity('vera', 4), trust('vera', 2), setFlag('vera_radio')],
      steps: [
        narrate(`You find the radio by feel — Bakelite, warm from the lamp. A late-night station, something slow with strings.`),
        narrate(`Vera stops writing.`),
        vera(`She always had it on this station.`, 'sad'),
        vera(`…Leave it on.`, 'neutral'),
      ],
    }),
  ]),

  when(
    C.not(C.flag('vera_slept')),
    [
      narrate(`At two, Vera turns a page, stops, and says something under her breath in a language that is not English.`),
      effects(setFlag('vera_heard_swearing')),
      me(`Was that Swedish?`),
      vera(`It was punctuation.`, 'embarrassed'),
      shot('c1_vera_desk_close'),
      vera(`There is a payment here. Every month since February. The same amount, to an account I do not recognise. The reference only says "Under the tide".`, 'worried'),
      effects(setFlag('saw_payments')),
      think(`Under the tide.`),
      vera(`Do not tell anyone. Not yet. Please.`),
      choice('c1_vera_secret', [
        option('promise', `"I promise."`, {
          effects: [trust('vera', 4), setFlag('promised_vera')],
          steps: [vera(`Thank you.`, 'neutral'), narrate(`She says it the way people say things they're not used to saying.`)],
        }),
        option('why', `"Why trust me with it?"`, {
          effects: [trust('vera', 2), affinity('vera', 2)],
          steps: [
            vera(`Because you are the only person on this island who had nothing to do with her last year.`, 'neutral'),
            vera(`That makes you either useless or safe. I have not decided which.`),
          ],
        }),
      ]),
    ],
    [
      narrate(`You watch the desk until four. Nobody calls. Nobody wants a room. The building does not catch fire.`),
      narrate(`At some point you realise you've been listening to it: the Halcyon at night. Pipes knocking. A door on the second floor nudged by a draught. The sea underneath everything.`),
      think(`And something else. Under the floor — faint, regular. Like a pump. Or an engine idling, very far down.`),
      effects(setFlag('heard_engine_sound')),
    ],
  ),
  jump('c1_morning'),
], { replayable: true });

// --- Noor: after hours --------------------------------------------------
export const c1NightNoor = scene('c1_night_noor', 'ch1', 'After Hours', [
  bg('low_tide_bar_closed', 'dissolve'),
  fx({ dust: true }),
  music('night_piano', 2),
  sfx('piano_note'),
  shot('c1_noor_piano_back'),
  narrate(`The side door sticks, as promised. Inside, the Low Tide is dark except for the fairy lights and one lamp on the piano.`),
  narrate(`Noor is playing. Not a song, exactly — the same four bars, over and over, changing one note each time, like someone trying keys in a lock.`),
  cg('cg_noor_piano'),
  think(`Good left hand. Lazy right. She's not playing, she's writing.`),
  narrate(`She sees you in the mirror behind the bar and doesn't stop.`),
  noor(`You came.`, 'neutral'),
  me(`You said the door sticks but isn't locked. That's practically an engraved invitation.`),
  noor(`By island standards it's a proposal.`, 'happy'),
  cg(null),
  shot('c1_noor_piano_close'),
  noor(`Sit. Don't say anything nice about it. It isn't finished.`, 'neutral'),

  choice('c1_noor_song', [
    option('listen', `Sit beside her and just listen.`, {
      effects: [affinity('noor', 5), trust('noor', 3), milestone('noor', 'after_hours')],
      steps: [
        narrate(`You sit on the end of the piano bench and say nothing at all.`),
        narrate(`She plays the four bars again, and this time she lets them go somewhere: up, and out, and down again into something that sounds like the sea against the cliff.`),
        noor(`…That's the first time I've played that for anyone.`, 'sad'),
      ],
    }),
    option('ear', `Tell her the bridge wants to go to the fourth.`, {
      effects: [affinity('noor', 4), trust('noor', 2), milestone('noor', 'after_hours'), setFlag('helped_noor_song')],
      steps: [
        noor(`…What?`, 'surprised'),
        me(`Sorry. Occupational hazard. I mix records — mixed. It keeps trying to go to the four and you keep stopping it.`),
        narrate(`She tries it. It goes there. It sounds like the thing she's been looking for.`),
        noor(`Oh, I hate that you're right.`, 'laughing'),
      ],
    }),
  ]),

  noor(`I had a record deal, you know. Three years ago. City label, real money, my face on a poster in a train station.`, 'sad'),
  noor(`Then the label folded, and the money turned out to be a loan, and the poster turned out to be the only thing I got to keep.`),
  me(`Is that who was on the phone? On the ferry.`),
  when(C.flag('noor_ferry_space'), [
    noor(`You heard that? I thought you were being polite.`, 'surprised'),
    me(`I was being polite. I still heard it.`),
  ]),
  noor(`…Some of it. I'm handling it.`, 'worried'),
  think(`She says "handling" the way people say "drowning".`),

  when(
    C.affinity('noor', { gte: 35 }),
    [
      narrate(`She's sitting close enough now that you can smell the orange peel on her fingers.`),
      noor(`This is a bad idea, isn't it.`, 'flirty'),
      choice('c1_noor_close', [
        option('tomorrow', `"Probably. Ask me again tomorrow."`, {
          effects: [affinity('noor', 3), setFlag('noor_tension')],
          steps: [noor(`Coward.`, 'laughing'), noor(`…Good answer, though.`, 'happy')],
        }),
        option('ask', `Ask if you can kiss her.`, {
          effects: [affinity('noor', 5), trust('noor', 4), setFlag('asked_to_kiss_noor')],
          steps: [
            me(`Can I kiss you?`),
            noor(`You — ask?`, 'surprised'),
            noor(`…Nobody asks.`, 'embarrassed'),
            noor(`Not tonight. Not because I don't want to. Because I want to want it on a night when I'm not this tired and this scared.`, 'neutral'),
            noor(`Ask me again, though. Please.`, 'flirty'),
          ],
        }),
      ]),
    ],
    [noor(`Go to bed, {player}. You've got a hotel to inherit in the morning.`, 'happy')],
  ),
  narrate(`You climb back up through the sleeping hotel with four bars of music stuck in your head, and the sense that you've just been trusted with something breakable.`),
  jump('c1_morning'),
], { replayable: true });

// --- June: the glow -----------------------------------------------------
export const c1NightJune = scene('c1_night_june', 'ch1', 'Bloom', [
  bg('cove_night', 'dissolve'),
  fx({ sparkle: true }),
  music('bloom', 3),
  shot('c1_cove_night_wide'),
  narrate(`The path down to the cove is steeper in the dark than it looked from the window. Then sand, cold and packed, and the hush of very small waves.`),
  narrate(`The light is a head torch. Under it, June is knee-deep in black water, filling jars.`),
  shot('c1_june_cove_close'),
  june(`Oh — it's you. Stay there. No, come here. No — take your shoes off first, and then come here.`, 'surprised'),
  narrate(`You roll up your trousers. The water is so cold it feels like a noise.`),
  june(`Now. Watch.`, 'happy'),
  narrate(`She drags her hand through the water, and the sea lights up.`),
  cg('cg_cove_glow'),
  effects(milestone('june', 'the_glow')),
  narrate(`Blue-green fire follows her fingers and spills off them in sparks. Every step you take kicks up a galaxy.`),
  think(`It makes no sound. That's the strange thing. It's completely silent, and it feels like it should be the loudest thing I've ever seen.`),
  june(`Every point of light is a single cell, smaller than the width of a hair. They glow when they're disturbed. A defence mechanism, probably. Like shouting.`, 'happy'),

  choice('c1_june_glow', [
    option('beautiful', `"It's beautiful."`, {
      effects: [affinity('june', 4)],
      steps: [june(`It's chemistry.`, 'neutral'), june(`…It's also beautiful. I'm allowed to say both.`, 'embarrassed')],
    }),
    option('why', `"You said it shouldn't exist. Why?"`, {
      effects: [trust('june', 5), affinity('june', 2), setFlag('june_mooring_hint')],
      steps: [
        june(`Blooms need warm water and nutrients. This cove has cold water and nothing to eat.`, 'neutral'),
        june(`And yet. Every month. Brightest right there —`, 'worried'),
        narrate(`She points out to a dark patch of water fifty metres off.`),
        june(`— over the old mooring. Something down there is feeding them. Heat, or nutrients, or both. Margit said she'd help me find out what.`),
      ],
    }),
    option('kick', `Kick the water and watch it explode with light.`, {
      effects: [affinity('june', 5)],
      steps: [
        june(`You're disturbing my sample area.`, 'laughing'),
        june(`Do it again.`, 'happy'),
        june(`Sorry. Science voice. That was — that was very good kicking.`, 'embarrassed'),
      ],
    }),
  ]),

  cg(null),
  shot('c1_june_cove_rock'),
  june(`Margit used to come down here with me. She'd sit on that rock with a flask and ask the worst questions. The best questions.`, 'sad'),
  june(`"What if it isn't the water? What if it's what's under it?"`),
  when(
    C.trust('june', { gte: 10 }),
    [
      june(`She was paying for my research. Privately. Nobody knows that. I don't know why I just told you.`, 'worried'),
      june(`The money stopped in March. I've got enough left for six weeks.`),
      effects(setFlag('june_funding_revealed')),
    ],
    [june(`Anyway. That's the cove. Mind the rocks going up. They're older than they look.`, 'neutral')],
  ),
  narrate(`Climbing back up, you look down once. The water where you stood is still glowing faintly, as if it remembers you.`),
  jump('c1_morning'),
], { replayable: true });

// --- Alone: the letter --------------------------------------------------
export const c1NightLetter = scene('c1_night_letter', 'ch1', 'For When You Arrive', [
  bg('player_room_night', 'none'),
  shot('c1_letter_desk'),
  music('mystery', 2),
  narrate(`The envelope is thick and cream-coloured and sealed with actual wax, because of course it is.`),
  narrate(`Inside, one sheet. Fountain pen. The handwriting leans forward, as if it was in a hurry to get somewhere.`),
  narrate(`"If you're reading this, I didn't come back. I'm sorry about that, and about the paperwork."`),
  narrate(`"I didn't leave you the Halcyon because you're family. Family is the excuse. I left it to you because you listen, and on this island people only ever talk."`),
  narrate(`"The hotel isn't the inheritance. Look under the tide."`),
  narrate(`"Trust Vera, even when she doesn't trust you. Bram knows more than he says. And whatever Aldane offers, ask them why. — M."`),
  think(`Look under the tide.`),
  narrate(`Something else slides out of the envelope and into your palm: a small, pale spiral shell, polished smooth from handling.`),
  think(`The shell. The one I gave back to her when I was six. She kept it for twenty years.`),
  shot('c1_letter_player'),
  narrate(`You hold it to your ear, the way she showed you.`),
  think(`The storm inside it. Still there.`),
  effects(setFlag('read_letter'), setFlag('has_shell')),

  choice('c1_letter_after', [
    option('window', `Watch the light on the beach.`, {
      effects: [setFlag('watched_cove_light')],
      steps: [
        narrate(`The light moves along the waterline, stops at the far end of the cove, goes out. Comes back on. Goes out again.`),
        think(`Like someone looking for something they dropped. Or signalling to someone who isn't answering.`),
      ],
    }),
    option('sleep', `Put the shell on the pillow and try to sleep.`, {
      steps: [
        think(`Ridiculous. I'm a grown adult with a shell on my pillow.`),
        narrate(`You fall asleep listening to it anyway.`),
      ],
    }),
  ]),
  jump('c1_morning'),
], { replayable: true });
