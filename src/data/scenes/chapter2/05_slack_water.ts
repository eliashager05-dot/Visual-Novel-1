import {
  affinity, bg, C, cg, choice, clock, effects, end, fx, me, music, narrate, option, rename, scene, setFlag, sfx,
  shot, speaker, think, title, transition, trust, when,
} from '../../story/dsl';

const vera = speaker('vera');
const noor = speaker('noor');
const june = speaker('june');
const sienna = speaker('sienna');
const margit = speaker('margit');

const companion = (who: string) => C.variable('companion', { eq: who });

// --- Slack water ----------------------------------------------------------------
export const c2SlackWater = scene('c2_slack_water', 'ch2', 'Slack Water', [
  bg('cove_night', 'fade'),
  clock('late'),
  fx({ fog: 'light', sparkle: true }),
  music('slack_water', 3),
  shot('c2_cove_path_night'),
  narrate(`The cove path at twenty to midnight. The fog has come in off the sea, low and white, and your torch makes a small room of light that walks down the steps with you.`),
  narrate(`The tide has gone further out than you have ever seen it. The old mooring stands on bare sand like a monument. Around its foot, faint as breath, the water glows.`),
  when(companion('vera'), [
    vera(`I have walked down these steps a thousand times. I have never been afraid of them before.`, 'worried'),
  ]),
  when(companion('noor'), [
    noor(`For the record, if this is a murder, I want it on the record that I said it looked like a murder.`, 'worried'),
  ]),
  when(companion('june'), [
    june(`Fourteen point two at the mooring. It's running right now. Whatever it is, it's on.`, 'surprised'),
  ]),
  when(companion('sienna'), [
    sienna(`I used to come down here at night as a kid to watch the water light up. I'd forgotten. How do you forget something like that?`, 'sad'),
  ]),
  when(companion('none'), [think(`If I break an ankle down here, nobody knows where I am. Brilliant plan. Very well thought through.`)]),

  shot('c2_cave_mouth'),
  narrate(`Under the east wing, at the foot of the cliff, the black gap you saw from the roof is open now: a mouth in the rock, taller than a door, with lantern light moving somewhere far inside.`),
  narrate(`And a sound. Low, steady, mechanical, like a heartbeat under the floor of the world.`),
  think(`I know that sound. I felt it through the soles of my feet on the first night and thought it was the sea.`),

  bg('sea_cave_night', 'dissolve'),
  fx({ fog: 'light', sparkle: true, flicker: 'lamp' }),
  shot('c2_cave_elin'),
  narrate(`Inside, the cave opens into a hall of wet black rock. The ELIN is here, the blue lobster boat, moored to an iron ring, rocking very slightly on the last of the water.`),
  narrate(`Behind it stands a machine the size of a car: a great green-painted pump, older than anything you have ever seen working, thudding steadily, its bronze pipe running down into the rock toward the cove.`),
  shot('c2_cave_camp'),
  narrate(`Someone lives here. A camp bed. A primus stove. A crate for a table, with one of Bram's steel plate covers on it, and a thermos, and a pipe laid down on a saucer, still faintly smoking.`),
  when(C.flag('june_found_pipe'), [think(`HALCYON BATHS, 1926. The other end of June's pipe.`)]),
  when(C.flag('followed_bram'), [think(`And above us, somewhere, the hatch in the floor of the shallow end, and the iron rungs Bram's basket came down.`)]),

  choice(
    'c2_cave',
    [
      option('call', `Call out: "Margit?"`, {
        effects: [setFlag('called_margit')],
        steps: [me(`Margit?`), narrate(`Your voice goes round the cave and comes back smaller.`)],
      }),
      option('wait', `Stay in the shadow of the boat, and wait.`, {
        effects: [setFlag('waited_in_cave')],
        steps: [narrate(`You switch off the torch and stand very still against the ELIN's cold planks. The pump thuds. Water drips. Somewhere behind the machine, someone sets down a mug.`)],
      }),
      option('pump', `Shut the pump off.`, {
        condition: C.not(companion('june')),
        effects: [setFlag('shut_pump')],
        steps: [
          narrate(`There's a big iron lever on the side of the machine with OFF stencilled on it in letters that were white in 1926. You put your weight on it.`),
          narrate(`The heartbeat stops. The silence afterwards is enormous. Out in the cove, the faint glow at the mooring begins, very slowly, to fade.`),
        ],
      }),
    ],
    'The cave.',
  ),

  shot('c2_margit_reveal'),
  sfx('splash'),
  narrate(`A figure steps out from behind the pump. A yellow oilskin, hood up, a storm lantern held high.`),
  narrate(`She pushes the hood back. Cropped grey hair. A face like a weathered sea chart. Pale-blue eyes you last saw when you were six years old, across a room full of black coats.`),
  cg('cg_margit_lantern'),
  when(
    C.flag('shut_pump'),
    [
      margit(`Turn that back on. Now.`, 'angry'),
      margit(`Unless you'd like to explain to the clever doctor in room seven why her little lights all died in one night.`),
      narrate(`You put the lever back. The heartbeat returns. She watches you do it, and only then does she look at your face.`),
    ],
    [
      when(
        C.flag('called_margit'),
        [margit(`I heard you the first time, boy. The whole cliff heard you.`, 'neutral')],
        [margit(`You stand like your grandfather did. Like a man waiting for his cue. Come out of there.`, 'neutral')],
      ),
    ],
  ),
  margit(`You were supposed to stop looking.`, 'neutral'),
  me(`You were supposed to be dead.`),
  margit(`Yes. Well. We've both been a disappointment.`, 'happy'),

  // Who came with you changes the first minute.
  when(companion('vera'), [
    shot('c2_vera_margit'),
    narrate(`Vera steps past you into the lantern light.`),
    vera(`You let me bury you.`, 'angry'),
    margit(`Hello, Vera.`, 'sad'),
    vera(`We held a service. Bram made the soup you hate. I read the poem you would have hated more. I stood on the slipway in the rain and spoke to the sea for an hour.`, 'sad'),
    margit(`I know. I was there. At the back, by the boathouse door.`, 'sad'),
    narrate(`Vera makes a sound you have never heard a person make. Then she crosses the cave in four strides and holds on to the old woman as if the tide were still coming in.`),
    effects(affinity('vera', 4), setFlag('vera_met_margit')),
  ]),
  when(companion('noor'), [
    noor(`Hi, Margit. Ropes held, then.`, 'sad'),
    margit(`They always do when you tie them, girl.`, 'happy'),
    noor(`I hate you a bit. I want that on the record too.`, 'angry'),
    margit(`Good. You've earned it.`, 'neutral'),
    effects(setFlag('noor_met_margit')),
  ]),
  when(companion('june'), [
    june(`You're the one switching it on. Every night. You're keeping the bloom alive.`, 'surprised'),
    margit(`Somebody had to keep your little lights going, Doctor. You took long enough writing them down.`, 'neutral'),
    june(`I write slowly because I write carefully! That's called science!`, 'angry'),
    margit(`That's called March to August. I've been living in a cave.`, 'laughing'),
    effects(setFlag('june_met_margit')),
  ]),
  when(companion('sienna'), [
    narrate(`Margit's lantern swings toward Sienna and stops there. For the first time, the old woman looks surprised.`),
    margit(`…Saoirse's girl.`, 'surprised'),
    when(
      C.milestone('sienna', 'saoirse'),
      [sienna(`Don't. Don't you dare say her name like you're allowed to. You bought my family's mooring for a lie and a bag of money.`, 'angry')],
      [sienna(`You knew my mother?`, 'surprised')],
    ),
    margit(`I bought it so the people you work for couldn't. Ask your mother which of us she'd rather sold it to.`, 'neutral'),
    effects(setFlag('sienna_met_margit'), trust('sienna', 2)),
  ]),
  when(companion('none'), [
    margit(`And you came alone. Good. You can follow an instruction. Half of one, at least.`, 'neutral'),
  ]),

  margit(`Sit down. Mind the oil.`, 'neutral'),
  shot('c2_margit_tea'),
  narrate(`She pours tea from Bram's thermos into two tin mugs and hands you one without asking if you want it. It is the strongest tea you have ever tasted. It is, you realise, where Bram learned.`),
  margit(`In February a man from a company called Aldane sat in my lobby and offered me more money than the Halcyon has made in forty years. For the cove. Not the hotel: the hotel, he said, they would happily knock down.`, 'neutral'),
  margit(`I threw him out. So they bought my bank loan instead. When they can't buy you, boy, they buy what you owe.`, 'angry'),
  margit(`Then one night someone cut the ELIN's lines in the harbour. And the next week, my brakes failed on the hill road.`, 'worried'),
  me(`They tried to kill you.`),
  margit(`They tried to make me sell. Dying would have been a side effect they could live with.`, 'neutral'),
  margit(`So I thought: if I'm dead, my will opens. Fifty-one percent to a boy who's never wanted a thing from me, forty-nine to a girl who'd sooner burn the place than sell it.`),
  margit(`Two owners who've never met, who both have to sign before anything is sold. That's not an inheritance. That's a lock. And I'm the only one who knows it's there.`, 'happy'),
  think(`Ninety days. Both signatures. Mine, and Vera's. She built the deadlock on purpose.`),
  margit(`The pump keeps the doctor's lights alive until her report reaches the marine board on the first of September. Protected water means no cable, and no cable means Aldane has nothing to buy.`, 'neutral'),
  margit(`Twenty-six days. That's all I needed. Twenty-six more days of everyone thinking I was at the bottom of the sea.`, 'sad'),
  margit(`And then you started looking.`),

  choice(
    'c2_margit',
    [
      option('angry', `"You let everyone grieve for you."`, {
        effects: [setFlag('margit_confronted')],
        steps: [
          margit(`Yes.`, 'neutral'),
          margit(`And they'd be grieving for the hotel next, and for each other after that. Grief passes, boy. Aldane doesn't.`, 'angry'),
          margit(`I'd do it again. Don't ask me to be sorry. I'm too old to start lying now.`, 'sad'),
          think(`She means it. And her hands are shaking round the mug.`),
        ],
      }),
      option('why', `"Why me? You met me once, when I was six."`, {
        effects: [setFlag('margit_why')],
        steps: [
          margit(`Your grandfather's funeral. You sat under the piano for the whole wake, listening to it, with your hands over your ears whenever anyone talked.`, 'happy'),
          margit(`Everyone else in this family wanted something from me. A loan. A room. A piece of the hotel. You wanted to hear the piano.`, 'neutral'),
          margit(`I thought: there's a Halloran who listens. There's a Halloran who won't sell.`, 'sad'),
          margit(`Don't make me wrong, boy. I've been wrong about a lot this year.`),
        ],
      }),
      option('help', `"What do you need from me?"`, {
        effects: [setFlag('margit_ally')],
        steps: [
          margit(`Ha. Straight to it. You've got that from your grandmother's side.`, 'laughing'),
          margit(`I need you not to sell. Not to Aldane, not to anyone, not for any money, for twenty-six days. Whatever they offer you. Whatever they threaten.`, 'neutral'),
          margit(`And I need you not to tell a soul I'm here. Not yet.`, 'worried'),
          when(C.any(companion('vera'), companion('noor'), companion('june'), companion('sienna')), [
            margit(`Well. Not another soul. You've already spent one.`, 'neutral'),
          ]),
        ],
      }),
    ],
    'Margit.',
  ),

  margit(`Tell me about them. I've only seen them through a hatch for five months.`, 'sad'),
  margit(`Is Vera eating?`, 'worried'),
  when(
    companion('vera'),
    [vera(`I am standing right here.`, 'angry'), margit(`So you are. You're too thin.`, 'neutral')],
    [me(`Not much. She works.`), margit(`She always works. She thinks if she stops, the building falls down. Sometimes she's right.`, 'sad')],
  ),
  margit(`And Bram's cooking for seven, I suppose. He always did overdo it.`, 'happy'),
  me(`He made the soup you hate. For the memorial.`),
  margit(`I know. I could smell it from the boathouse.`, 'laughing'),

  narrate(`Behind you, out in the cove, the tide has started to turn. You can hear it in the cave mouth: the first slow breath of the sea coming back.`),
  margit(`That's the end of slack water. In two hours this cave is full to the roof, and so is your head.`, 'neutral'),
  margit(`You've inherited fifty-one percent of a hotel, boy, and a hundred percent of a war. And I've got until the first ferry to explain the rest of it to you.`),
  when(C.flag('margit_confronted'), [me(`I haven't forgiven you.`), margit(`Good. Don't rush it. I'll be here. Apparently.`, 'sad')]),
  when(C.flag('margit_why'), [me(`I'm not selling.`), margit(`I know, boy. I've known since you were six.`, 'happy')]),
  when(C.flag('margit_ally'), [me(`Twenty-six days.`), margit(`Twenty-six days. Write it on your hand. I did.`, 'neutral'), narrate(`She holds up her palm. In faded biro: 1 SEPT.`)]),
  narrate(`She picks up the pipe from its saucer, looks at it, and puts it down again without lighting it.`),
  margit(`And mind you don't tell Bram I said his soup was bad. He knows. But he doesn't know I know he knows.`, 'neutral'),
  think(`My great-aunt is alive, living in a cave under my hotel, at war with a company that wants the bottom of the sea. And she's worried about the soup.`),
  rename('unknown', 'Margit'),
  transition('black', 2),
  cg(null),
  title('End of Chapter Two', 'Slack Water'),
  end({ chapterComplete: true }),
], { replayable: true });
