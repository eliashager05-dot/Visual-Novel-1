import {
  affinity, bg, C, cg, choice, effects, fx, jump, me, milestone, music, narrate, option, scene, setFlag, sfx,
  shot, speaker, think, transition, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const noor = speaker('noor');
const june = speaker('june');
const sienna = speaker('sienna');

// --- Noor: bailing out the Low Tide ---------------------------------------
export const c2NoorBar = scene('c2_noor_bar', 'ch2', 'Bailing Out', [
  bg('low_tide_bar_day', 'fade'),
  music('low_tide', 3),
  shot('c2_bar_flooded'),
  narrate(`The Low Tide in daylight is a different animal. The street door is propped open, a hosepipe snakes up the stairs, and the floor is a dark, ankle-deep lake with beer mats floating on it like lily pads.`),

  when(
    C.flag('accused_noor'),
    [
      shot('c2_noor_door'),
      narrate(`Noor is halfway up the stairs with a bucket. She sees you and doesn't stop.`),
      noor(`If you've come to ask where I was last night, I was here. With this. Ask the mop.`, 'angry'),
      choice('c2_noor_door', [
        option('sorry', `"I was wrong to say that. I'm sorry."`, {
          effects: [trust('noor', 5), affinity('noor', 2), setFlag('apologised_noor')],
          steps: [
            noor(`…`, 'surprised'),
            noor(`Nobody on this island has apologised to me since 2019. You're making me nervous.`, 'embarrassed'),
            noor(`Fine. Grab a bucket. Apology accepted on a trial basis.`, 'neutral'),
          ],
        }),
        option('still', `"I still think you know more than you're saying."`, {
          effects: [trust('noor', -1)],
          steps: [
            noor(`Everyone on this island knows more than they're saying, fifty-one percent. That's what an island is.`, 'angry'),
            noor(`Grab a bucket. I need hands more than I need to be right.`, 'neutral'),
          ],
        }),
      ]),
    ],
    [
      shot('c2_noor_bucket'),
      when(
        C.flag('noor_confessed_march'),
        [
          narrate(`Noor is wading through it in green wellies with a bucket in each hand, and she looks, absurdly, better than you've ever seen her.`),
          noor(`I slept. Six hours. First time since March. Turns out telling someone is cheaper than gin.`, 'happy'),
        ],
        [
          narrate(`Noor is wading through it in green wellies with a bucket in each hand, singing something tuneless at the water to keep it in line.`),
          noor(`Ah. The cavalry. Grab a bucket, fifty-one percent. Your bar is on the floor.`, 'happy'),
        ],
      ),
    ],
  ),

  shot('c2_bar_chain'),
  narrate(`The work is simple and endless. Noor runs it like a ship: you on the stairs, her in the water, the buckets going up full and coming down empty.`),
  noor(`Faster, fifty-one percent. The sea's not going to un-flood my bar out of courtesy.`, 'laughing'),
  noor(`This happens every big storm. Water comes down the street, through the door and into the only room on the island that sells alcohol. Margit called it natural justice.`, 'neutral'),
  narrate(`It takes two hours. Bucket, stairs, street, back. Somewhere in the second hour you stop talking and fall into a rhythm, and somewhere in the rhythm she starts humming, and the humming turns into a tune.`),
  noor(`Don't look at me like that. It's a work song. Sailors did it. Very traditional. Nothing to do with feelings.`, 'embarrassed'),
  when(C.flag('noor_ferry_asked'), [noor(`You asked me how I was, on the ferry. Nobody does that. I've been thinking about it for three days, which is embarrassing for both of us.`, 'embarrassed')]),
  noor(`You were a sound engineer. Bram told me. Bram tells me everything if I feed him crisps.`, 'neutral'),
  noor(`Whose records? Anyone I'd know?`),
  me(`Nobody you'd know. Lots of people nobody knows. I was good at making them sound like somebody.`),
  noor(`That's the saddest job description I've ever heard. And I've had a record deal.`, 'laughing'),
  noor(`I write songs on receipts. Behind the bar, between orders. There's a shoebox of them under the till. Three years of other people's bar tabs with my whole life on the back.`, 'embarrassed'),
  choice(
    'c2_noor_mix',
    [
      option('record', `"Let me record them. Properly."`, {
        effects: [affinity('noor', 3), setFlag('promised_to_record_noor')],
        steps: [
          noor(`…Don't. Don't say things like that in a flooded cellar. I'll believe you.`, 'surprised'),
          me(`Believe me. I've got nothing else to do with my ears for eighty-eight days.`),
          noor(`Right. Well. If the bar's still here, and you're still here. We'll see.`, 'happy'),
          narrate(`She hums the rest of the next bucket. Louder.`),
        ],
      }),
      option('honest', `"I'm not sure I'm any good any more."`, {
        effects: [trust('noor', 3)],
        steps: [
          noor(`Oh, thank God. Someone else who isn't sure.`, 'laughing'),
          noor(`Everyone on this island is so certain. Vera's certain. June's certain. Bram's certain about soup. It's exhausting.`),
          noor(`Let's be not sure together. It's cheaper than therapy, and the bar's already wet.`, 'happy'),
        ],
      }),
    ],
    'Receipts.',
  ),

  choice(
    'c2_noor_truth',
    [
      option('ledger', `"Margit was paying you. Six hundred a month."`, {
        condition: C.flag('found_margit_ledger'),
        effects: [trust('noor', 3), setFlag('noor_told_payments')],
        steps: [
          noor(`…You found her book.`, 'worried'),
          narrate(`She puts the bucket down in the water and leaves it there.`),
          noor(`The record deal. The advance turned out to be a loan, and the label turned out to be two men and a lawyer. I owed forty thousand at twenty-four. I was paying it back in tips.`, 'sad'),
          noor(`Margit found out. She paid it. Every month, straight to them, so I couldn't refuse.`),
          noor(`All she asked was that I keep the ELIN's tank full and the ropes in good order, and say nothing to anyone. She said she might need to take a trip one day.`),
          noor(`I thought she meant a holiday. I'm an idiot.`, 'sad'),
          me(`You're not an idiot. You're a friend she made a promise with.`),
          noor(`Same thing, on this island.`, 'neutral'),
        ],
      }),
      option('song', `"Play me the work song. Properly."`, {
        effects: [affinity('noor', 5), milestone('noor', 'the_song')],
        steps: [
          narrate(`She looks at you for a long moment. Then she wades to the back, comes back with a battered guitar held over her head like a rescued child, and sits on an upturned crate in the middle of the flood.`),
          cg('cg_noor_song'),
          noor(`It's not finished. It's about March. Don't say anything when it's over.`, 'worried'),
          narrate(`It's three chords and a voice that's been through something. A woman on a slipway in the dark. Ropes that hold. A promise that doesn't.`),
          narrate(`"Tie it tight, she said, tie it like you mean it. I tied it like I meant it, and I've meant it ever since."`),
          narrate(`When it ends, you don't say anything. That seems to be the right answer.`),
          when(
            C.any(C.flag('asked_to_kiss_noor'), C.affinity('noor', { gte: 30 })),
            [
              when(
                C.flag('asked_to_kiss_noor'),
                [noor(`Last time, you asked. On the piano stool. I've been thinking about that too.`, 'embarrassed')],
                [noor(`You didn't say anything. That's the best review I've ever had.`, 'embarrassed')],
              ),
              noor(`My turn to ask. Can I kiss you?`, 'flirty'),
              choice('c2_noor_kiss', [
                option('yes', `"Yes."`, {
                  effects: [affinity('noor', 4), setFlag('kissed_noor')],
                  steps: [
                    narrate(`She sets the guitar down in the water, which she will regret later, and leans across the space between the crate and the stairs.`),
                    narrate(`It's short, and careful, and tastes faintly of salt and the end of a song.`),
                    noor(`Right. Good. Buckets.`, 'embarrassed'),
                  ],
                }),
                option('later', `"Ask me again when this is over."`, {
                  effects: [trust('noor', 4), setFlag('noor_waiting')],
                  steps: [
                    noor(`…Yeah. That's fair. That's actually really fair.`, 'happy'),
                    noor(`I'll ask. I'm very persistent. Ask anyone who's owed me money.`, 'laughing'),
                  ],
                }),
              ], 'Noor asks.'),
            ],
          ),
          cg(null),
        ],
      }),
      option('scarf', `Give her back the orange scarf.`, {
        condition: C.not(C.flag('accused_noor')),
        effects: [affinity('noor', 3), trust('noor', 2), setFlag('returned_scarf')],
        steps: [
          narrate(`You take it out of your pocket. It has dried stiff with salt.`),
          noor(`…Oh.`, 'surprised'),
          noor(`She gave me this. Margit. The Christmas after I came back. She said I looked like a lighthouse in it.`, 'sad'),
          narrate(`She ties it in her hair without a mirror, perfectly, in one movement.`),
          noor(`Somebody took it off my hook behind the bar. Somebody who knew it would get noticed in that boathouse.`, 'worried'),
        ],
      }),
    ],
    'Noor.',
  ),

  when(C.flag('vera_moment'), [
    noor(`Can I ask you something nosy? It's my job. Bartender. Legally required.`, 'flirty'),
    noor(`You and Vera, on the slipway last night. Bram says you caught her and she didn't let go for a full second. Bram counts.`, 'neutral'),
    me(`Bram talks a lot for a man who doesn't talk.`),
    noor(`Only to me. I feed him crisps. Don't change the subject.`, 'laughing'),
    noor(`I'm not asking because I mind. I'm asking so I know whether to.`, 'embarrassed'),
  ]),
  noor(`Margit used to come down after closing and sit on the piano stool and tell me my songs were too sad.`, 'sad'),
  noor(`"You're twenty-six," she said. "Write something with a boat in it that doesn't sink."`),
  noor(`I never did. I'm going to now. Out of spite. That's how this island works: everyone does everything out of spite.`, 'laughing'),

  shot('c2_noor_door_light'),
  narrate(`By four the floor is wet stone instead of water. Noor props the mop against the piano and stands in the slice of daylight from the street door, looking up at the hotel.`),
  noor(`Can I tell you something that'll sound mad?`, 'worried'),
  noor(`I close up at two most nights. And most nights since April, I've seen Bram cross the yard at about eleven with a basket. Big man, small basket. Into the east wing.`),
  noor(`I thought he had a girlfriend. I was going to tease him about it. Then I didn't, because he looked like a man carrying something to a grave.`, 'sad'),
  effects(setFlag('noor_saw_basket')),
  transition('fade', 1),
  jump('c2_evening'),
], { replayable: true });

// --- June: slack water at the mooring --------------------------------------
export const c2JuneSlack = scene('c2_june_slack', 'ch2', 'The Mooring', [
  bg('cove_low_tide_day', 'fade'),
  fx({ fog: 'light' }),
  music('bloom', 3),
  narrate(`The cove after the storm is a different place. The beach has moved: new rocks uncovered, old ones buried, a whole tree trunk lying across the sand where yesterday there was nothing.`),
  shot('c2_june_drysuit'),
  narrate(`June is waiting at the bottom of the cliff path in a black drysuit with the hood down, a coil of yellow line over one shoulder and a second pair of waders over the other.`),
  june(`You came. Good. Put these on. They're Bram's. If they leak, it's his fault and you're legally entitled to soup.`, 'happy'),
  when(C.flag('june_plumber_joke'), [june(`I'm aware you're not a plumber. I've been aware since dinner. I just enjoy it.`, 'flirty')]),
  shot('c2_slack_wide'),
  narrate(`At ten to three the tide stops. You'd never noticed before that the sea does that. The water simply stops moving, out to the iron ring of the old mooring, flat and grey and waiting.`),
  june(`Slack water. Twenty minutes where nothing goes anywhere. Best time for looking.`, 'neutral'),
  june(`Do you know what's glowing in there? Dinoflagellates. Single cells. They light up when they're disturbed, like a fright. Every flash you saw is something tiny going "oh!"`, 'happy'),
  june(`Except these ones aren't quite the species they should be. The light's bluer. They bloom in August, which is wrong. They only live in the warm patch, which is wronger.`, 'surprised'),
  me(`So you've found something new.`),
  june(`Maybe. Or something very old that only survived because someone kept the water warm for a hundred years by accident.`, 'neutral'),
  june(`I've spent my whole career being the person in the room who cares too much about plankton. It's nice, just for once, for the plankton to matter.`, 'embarrassed'),
  narrate(`You wade out together. Knee-deep. Thigh-deep. Waist-deep, and the cold is a fist. Then, three metres from the mooring, it isn't.`),
  narrate(`The water around your legs turns warm. Bath-warm. A plume of it rising from somewhere under your feet, carrying a faint, glittering haze.`),
  june(`There. Feel that? That's my fourteen degrees.`, 'surprised'),

  shot('c2_pipe_mouth'),
  narrate(`June ducks under for a long count of ten and comes up gasping, hair plastered flat, grinning like a child.`),
  june(`It's a pipe. A bronze pipe, this wide, coming out of the rock under the mooring. There's lettering on the flange.`, 'laughing'),
  june(`HALCYON BATHS. 1926.`),
  think(`The baths in the east wing. Heated seawater, piped up from the cove. Or, apparently, piped back down into it.`),
  june(`It's an outflow. Something up in that cliff is pumping warm water into my cove, and has been for months. That's why the mud is warm. That's why the bloom lives here and nowhere else on this coast.`, 'surprised'),
  june(`It ran last night at seven forty. It's running now. Somebody is switching it on.`, 'worried'),
  effects(setFlag('june_found_pipe')),

  choice(
    'c2_june_water',
    [
      option('in', `Duck under and look for yourself.`, {
        effects: [affinity('june', 5), milestone('june', 'cold_water')],
        steps: [
          cg('cg_june_pipe'),
          narrate(`You take a breath and go under, eyes open, salt stinging. June's hand finds yours in the murk and guides it to the metal.`),
          narrate(`The bronze is warm. Warm water pours over your fingers, and in it, tiny points of light come and go like breath on glass.`),
          narrate(`You come up together, coughing, laughing for no reason anyone else would understand.`),
          june(`Nobody ever goes under with me. They hold the line and say "rather you than me".`, 'happy'),
          when(C.affinity('june', { gte: 30 }), [june(`You're turning blue. I'm going to stand very close to you on the way back. For scientific reasons.`, 'flirty')]),
          cg(null),
        ],
      }),
      option('line', `Hold the line, and keep her safe.`, {
        effects: [trust('june', 4)],
        steps: [
          narrate(`You brace on the mooring ring with the line round your forearm while she dives twice more, counting her breaths out loud each time she comes up.`),
          june(`You counted with me. I heard you. Nobody counts with me.`, 'surprised'),
          june(`Thank you. Really. It's easier to be brave with someone holding the other end.`, 'happy'),
        ],
      }),
      option('money', `"Did Margit pay you to find this?"`, {
        condition: C.any(C.flag('found_margit_ledger'), C.flag('june_funding_revealed')),
        effects: [trust('june', 2), setFlag('june_told_why')],
        steps: [
          june(`Yes.`, 'neutral'),
          june(`She found me through a paper nobody read. Paid for everything, sensors, the room, my rent on the mainland. She only asked one thing: document the bloom. Every night. Properly.`),
          june(`I thought she was a rich eccentric who liked plankton. Now I think she was building a case.`, 'worried'),
          june(`A unique bioluminescent habitat gets protected status. Protected status means nothing gets built on that seabed. No pipeline. No cable. No Aldane.`),
          june(`She wasn't paying me to study the cove, {player}. She was paying me to save it.`, 'sad'),
        ],
      }),
    ],
    'The pipe.',
  ),

  narrate(`Wading back, June talks the way people do when they've been cold and frightened and then suddenly not: fast, and about everything.`),
  june(`Eight months I've been in room seven. Do you know how many people have asked me a question twice? A follow-up. Actually listened to the first answer.`, 'neutral'),
  june(`Margit. And you.`, 'embarrassed'),
  june(`She used to sit on the rocks with a flask while I counted, and ask what each one was called. The next night she'd ask again, to see if I said it the same way.`, 'sad'),
  june(`I thought she was getting forgetful. She wasn't. She was checking my data.`, 'laughing'),

  shot('c2_june_blanket'),
  narrate(`The tide turns while you're wading back. You feel it before you see it: a gentle, insistent pull at your legs, the whole sea changing its mind.`),
  narrate(`On the beach June wraps you both in one foil blanket, which crackles absurdly, and looks up at the cliff. At the east wing's dark windows, right above the mooring.`),
  june(`The pipe goes up into that rock. Whatever's pumping it is right under your hotel.`, 'worried'),
  june(`I'm going to need a very good reason to be in that building after dark.`),
  choice(
    'c2_june_reason',
    [
      option('owner', `"You've got one. I own fifty-one percent of it, and I'm inviting you."`, {
        effects: [affinity('june', 3), setFlag('june_invited_in')],
        steps: [
          june(`Is that a formal invitation? From management?`, 'flirty'),
          june(`I'm going to frame it. I don't have a frame. I'll frame it in my head.`, 'laughing'),
        ],
      }),
      option('careful', `"Wait. If someone's down there, we don't know what they want."`, {
        effects: [trust('june', 3)],
        steps: [
          june(`…You're right. I hate it, but you're right. Whoever is switching that pump on knows exactly what it does to my cove.`, 'worried'),
          june(`Someone who knows that much about my cove isn't an enemy. Probably. I'd still like a torch.`),
        ],
      }),
    ],
    'June.',
  ),
  transition('fade', 1),
  jump('c2_evening'),
], { replayable: true });

// --- Sienna: the causeway --------------------------------------------------
export const c2SiennaCauseway = scene('c2_sienna_causeway', 'ch2', 'The Causeway', [
  bg('causeway_day', 'fade'),
  music('sienna_theme', 3),
  sfx('gull'),
  shot('c2_causeway_wide'),
  narrate(`The causeway runs out across a tidal inlet on the west of the island to a scrap of grass and stone called the Holm. Halfway along, the storm has simply taken it: ten metres of road gone, the sea sliding through the gap.`),
  narrate(`On the near side, a dark rental car is nose-down in the ditch. On a bollard beside it, in Bram's jumper and a pair of wellies three sizes too big, sits Sienna Marlowe.`),
  narrate(`The wind out here comes straight off the Atlantic with nothing in its way. It smells of salt and cut grass and, faintly, of the car's leaking petrol.`),
  shot('c2_sienna_bollard'),
  sienna(`My hero. Or a passer-by. Either way, push.`, 'flirty'),
  shot('c2_car_push'),
  narrate(`You push. She steers. The car moves exactly as much as a house would. On the fourth try a back wheel spins and sprays you from the knees down with something that is mostly seaweed.`),
  sienna(`Oh, that's beautiful. Stay still, I want to remember this.`, 'laughing'),
  when(C.flag('flirted_sienna'), [sienna(`You did say you'd let me buy you a drink. I didn't think it'd be a drink of the ditch.`, 'flirty')]),
  narrate(`You get her suitcase out of the boot, at least, and sit on it together on the bollard while the tide goes out of the inlet.`),

  shot('c2_holm_walk'),
  narrate(`At low water the gap in the causeway turns to wet sand. Sienna watches it for a while. Then she stands up, without a word, and walks out across it toward the Holm.`),
  narrate(`You follow. There's a cottage on the islet, or there was: four stone walls, no roof, a doorway facing the hotel across the water.`),
  sienna(`I was born in there. Well. In the kitchen, which was then a kitchen.`, 'neutral'),
  sienna(`My father fished from the old mooring in the cove. So did his father. The Marlowes held the licence for that mooring for ninety years. Very grand. It's a rusty ring in the sea.`, 'neutral'),
  sienna(`Mam left when I was twelve. Went to the mainland one morning on the first ferry and never came back. After that it was Da and me and the bottle, and then it was just me.`, 'sad'),

  choice(
    'c2_sienna_truth',
    [
      option('photo', `Tell her about the photograph in Margit's room.`, {
        condition: C.visited('c1_margit_room'),
        effects: [affinity('sienna', 5), trust('sienna', 3), milestone('sienna', 'saoirse')],
        steps: [
          me(`There's a photograph over Margit's desk. Thirty years old. Margit on the ELIN, and a young woman with her arm round her, holding up a fish nearly as long as her arm.`),
          narrate(`Sienna goes completely still.`),
          sienna(`A pollock. Twenty-two pounds. Mam caught it off the ELIN when she was nineteen.`, 'surprised'),
          sienna(`It's the only story she ever told me twice.`, 'sad'),
          cg('cg_sienna_holm'),
          narrate(`She puts her hand flat on the wall of the cottage, on the stone, as if it's warm.`),
          sienna(`S.M. In Margit's book. Not me. Saoirse Marlowe.`),
          sienna(`The licence was Mam's when Da died. Aldane's file says it was sold in March to M. Halloran. I thought Margit had found some lawyer's trick. I never thought—`, 'worried'),
          sienna(`Paid in full. My mother never paid anything in full in her life. Somebody paid her.`, 'sad'),
          sienna(`And she sold the one thing this family ever owned without telling me. Again.`, 'angry'),
          cg(null),
          effects(setFlag('knows_saoirse')),
        ],
      }),
      option('aldane', `"What does Aldane actually want with the cove?"`, {
        effects: [trust('sienna', 2)],
        steps: [
          when(
            C.any(C.flag('sienna_off_record'), C.trust('sienna', { gte: 15 })),
            [
              sienna(`A cable. Under the sea, from the wind farm they're building off the north cape to the mainland grid.`, 'neutral'),
              sienna(`It has to come ashore somewhere sheltered, somewhere deep enough, somewhere nobody can stop them. Your cove is the only one on this coast that fits. Forty years of lease on that seabed is worth more than every hotel in the country.`),
              sienna(`They don't want your building. They want the ditch they can dig in front of it.`, 'sad'),
              effects(setFlag('knows_aldane_cable')),
            ],
            [
              sienna(`What does anyone want? Growth. Synergy. A lovely view of the sea.`, 'flirty'),
              sienna(`Ask me again when I'm not technically on the clock.`, 'neutral'),
            ],
          ),
        ],
      }),
      option('jumper', `"Bram's jumper suits you, you know."`, {
        effects: [affinity('sienna', 3)],
        steps: [
          sienna(`It does not. I look like a sheep that's been through a divorce.`, 'laughing'),
          sienna(`…Thank you, though. People usually compliment the coat. You complimented the woman wearing a borrowed jumper in a ditch.`, 'embarrassed'),
          sienna(`That's either very kind or very good tactics, and I genuinely can't tell which.`, 'flirty'),
        ],
      }),
    ],
    'Sienna.',
  ),

  narrate(`You sit on the cottage wall out of the wind. From here the Halcyon looks small, white and stubborn on its cliff.`),
  sienna(`I've closed eleven deals for Aldane. Hotels, farms, a lighthouse. Every time I told myself the same thing: someone was going to buy it anyway. Better me. I'm nice about it.`, 'neutral'),
  sienna(`They sent me here because I was born here. They said I'd "understand the community". I thought it was a compliment.`, 'sad'),
  sienna(`It wasn't. It was a strategy. I was the strategy.`, 'angry'),
  when(C.milestone('sienna', 'bracelet'), [
    sienna(`The bracelet's hers, you know. Mam's. Plaited fishing line. She made it the week before she left, and I've never once taken it off, which is pathetic.`, 'sad'),
    me(`It isn't.`),
    sienna(`It is. But thank you.`, 'happy'),
  ]),

  shot('c2_sienna_satphone'),
  sfx('phone_buzz'),
  narrate(`On the way back across the sand something buzzes in her suitcase. She digs out a chunky satellite phone, the kind companies give people they want to reach anywhere, and reads the screen.`),
  narrate(`Her face does something complicated.`),
  sienna(`Aldane. They're sending a team on the first ferry. Engineers and a lawyer.`, 'worried'),
  sienna(`Someone has been running an old pump in the cove, and the warm water is "interfering with the survey". They want it found and switched off.`),
  sienna(`They know, {player}. I didn't tell them. But they know.`, 'sad'),
  effects(setFlag('sienna_warned_aldane')),
  narrate(`She stands on the wet sand between the Holm and the hotel with the phone in her hand, looking from one to the other.`),
  choice(
    'c2_sienna_side',
    [
      option('ask', `"Whose side are you on, Sienna?"`, {
        effects: [trust('sienna', 1)],
        steps: [
          sienna(`This morning I'd have said: my client's. Always my client's. That's the job.`, 'neutral'),
          sienna(`Now I'm standing in my mother's kitchen with no roof on it, and I don't know any more.`, 'sad'),
          sienna(`Ask me again tomorrow. I'll either have an answer or a better lie.`, 'neutral'),
        ],
      }),
      option('trust', `"You told me. That's enough for now."`, {
        effects: [affinity('sienna', 3), trust('sienna', 3), setFlag('sienna_trusted')],
        steps: [
          sienna(`…That's a very dangerous thing to say to someone like me.`, 'surprised'),
          sienna(`People don't usually trust me. They hire me. It's a different feeling. I'm not sure what to do with my hands.`, 'embarrassed'),
          narrate(`She puts the phone away, in the suitcase, under the jumper she isn't wearing.`),
        ],
      }),
      option('first', `"Then help me find that pump before they do."`, {
        effects: [trust('sienna', 2), setFlag('sienna_asked_to_help')],
        steps: [
          sienna(`You want me to betray the company that pays for my flat, my car and my extremely good dentist.`, 'neutral'),
          sienna(`…I'll think about it. That's more than I've said to anyone in eleven deals.`, 'flirty'),
        ],
      }),
    ],
    'Sienna.',
  ),
  narrate(`A man with a tractor and no front teeth arrives at five and pulls the car out in forty seconds. He refuses money and accepts a promise of a drink from Sienna, which seems to be the better deal.`),
  transition('fade', 1),
  jump('c2_evening'),
], { replayable: true });

// --- Vera: the missing C -----------------------------------------------------
export const c2VeraRoof = scene('c2_vera_roof', 'ch2', 'The Missing C', [
  bg('hotel_roof_day', 'fade'),
  music('morning', 3),
  narrate(`You climb up through a hatch in the attic of the fourth floor, past fifty years of broken chairs and one stuffed seal nobody can explain, and come out into wind and light.`),
  shot('c2_roof_tarps'),
  narrate(`You spend the afternoon on the roof with Vera, twenty buckets and a roll of tarpaulin, chasing the leaks into room four, room nine and room twenty-two.`),
  vera(`Pull. No, pull. Toward me. Toward the person who is not falling off the building.`, 'neutral'),
  narrate(`She is better at this than you, and very slightly enjoys it.`),
  when(C.milestone('vera', 'first_truce'), [vera(`This is what together looks like, by the way. Tarpaulin. Nobody puts it in the brochure.`, 'happy')]),
  shot('c2_roof_break'),
  narrate(`Around four you sit on an upturned bucket each, behind a chimney stack out of the wind, and share a flask of Bram's tea that has somehow got stronger since breakfast.`),
  vera(`May I ask you something, as your business partner?`, 'neutral'),
  vera(`If this were all yours, the whole hundred percent, and there were no bank, no Aldane, no ninety days. What would you do with it?`),
  choice(
    'c2_vera_future',
    [
      option('open', `"Open the baths again. Fill them up. Let people swim."`, {
        effects: [affinity('vera', 4), setFlag('dream_baths')],
        steps: [
          vera(`…That is the most irresponsible financial plan I have ever heard.`, 'surprised'),
          vera(`Heating, filtration, lifeguards, insurance, the roof.`, 'neutral'),
          vera(`I have thought about it every single day for ten years.`, 'happy'),
        ],
      }),
      option('studio', `"Put a studio in the cellar. Bands could come and record by the sea."`, {
        effects: [affinity('vera', 2), affinity('noor', 1), setFlag('dream_studio')],
        steps: [
          vera(`A recording studio. Under a hotel. On an island with one ferry.`, 'neutral'),
          vera(`Noor would never leave it. She would sleep on the mixing desk. You would have to charge her rent in songs.`, 'laughing'),
          vera(`…It is not a terrible idea. Do not tell her I said so.`, 'happy'),
        ],
      }),
      option('you', `"Honestly? Ask you what to do with it."`, {
        effects: [trust('vera', 4)],
        steps: [
          vera(`That is a cheat. You are not allowed to answer a question with me.`, 'embarrassed'),
          vera(`…But I would tell you. I have a list. It is forty pages. It has tabs.`, 'happy'),
        ],
      }),
    ],
    'If it were all yours.',
  ),

  narrate(`Back to work. The wind catches the corner of the tarpaulin and slaps Vera across the face with it, and she says something in Swedish, at length, with real feeling.`),
  me(`What was that?`),
  vera(`A weather report.`, 'embarrassed'),
  effects(setFlag('vera_heard_swearing')),
  vera(`I have not had a day off since 2019. I counted on the slipway last night, while we were waiting for the storm to kill us. It passed the time.`, 'neutral'),
  me(`Take tomorrow off.`),
  vera(`Tomorrow there will still be four leaking rooms and a bank. I will take a day off when I am dead.`, 'neutral'),
  vera(`…Possibly not even then. Margit certainly has not.`, 'sad'),

  shot('c2_roof_sign'),
  narrate(`At the seaward edge of the roof stands the back of the sign: THE HAL YON in iron letters a metre high, each one wound with old glass tubing. The C is dark. It has been dark since you arrived.`),
  vera(`It went in 2016. Margit said we would fix it when we could afford to.`, 'neutral'),
  vera(`We never could. So it became the name. The guests think it is charming. The postman thinks we are called the Hal Yon.`, 'laughing'),
  narrate(`You lean over the parapet to look at it. The tube isn't broken. A wire has corroded through behind the transformer box, green and furry with salt.`),
  think(`Nine years of fixing studio patch bays at two in the morning. I know this fault.`),

  choice(
    'c2_neon',
    [
      option('fix', `"Hand me that screwdriver."`, {
        effects: [affinity('vera', 5), milestone('vera', 'missing_c')],
        steps: [
          narrate(`It takes twenty minutes, a strip of wire cut from a lamp in room twenty-two, and a piece of Vera's hair grip to hold it while the tape sets.`),
          narrate(`At dusk she throws the switch.`),
          sfx('power_down'),
          cg('cg_neon_roof'),
          narrate(`The tubes stutter, buzz, and catch, one letter after another, a warm pink light running along the iron: THE HAL—`),
          narrate(`—CYON.`),
          narrate(`Vera doesn't say anything at all. She sits down on the parapet and laughs, a short, surprised sound, with her hand over her mouth.`),
          vera(`Nine years. Nine years, and you did it with my hair grip.`, 'laughing'),
          vera(`She would have liked you. That is not a compliment. She liked very difficult people.`, 'happy'),
          cg(null),
        ],
      }),
      option('leave', `"Leave it. It's the hotel's face now."`, {
        effects: [trust('vera', 3)],
        steps: [
          vera(`…Yes.`, 'surprised'),
          vera(`Everyone who has ever offered to fix it wanted to fix something about the Halcyon. You are the first one who wanted to leave something alone.`, 'neutral'),
          vera(`I will not tell you how much that matters. You would only become unbearable.`, 'happy'),
        ],
      }),
    ],
    'The sign.',
  ),

  shot('c2_roof_cove'),
  narrate(`From the parapet you can see straight down into the cove. The tide is the lowest you've seen it, the old mooring standing high and rusted out of wet sand.`),
  narrate(`And at the foot of the cliff, right under the east wing, there's a black gap in the rock that wasn't there yesterday. A mouth. The sea hides it, you realise, every hour except these.`),
  vera(`I have lived here ten years. I have never seen that.`, 'worried'),
  vera(`…And the ELIN is not on the slipway. I checked the boathouse at noon. It is gone again.`, 'worried'),
  effects(setFlag('saw_cave_mouth'), setFlag('elin_gone_again')),
  vera(`One more thing, since we are being honest on a roof. Bram has been cooking for seven since April. We are six. I have not asked him why, because I am afraid of the answer.`, 'sad'),
  effects(setFlag('vera_seven_plates')),
  fx(null),
  transition('fade', 1),
  jump('c2_evening'),
], { replayable: true });
