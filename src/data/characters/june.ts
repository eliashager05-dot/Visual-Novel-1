import { EXPRESSIONS, type CharacterDefinition } from '@/types';
import { C } from '../story/dsl';

export const june: CharacterDefinition = {
  id: 'june',
  name: 'Dr. Juniper Castell',
  shortName: 'June',
  age: 31,
  role: 'major',
  romanceable: true,
  color: '#8fd3c1',
  occupation: 'Marine ecologist, long-term guest in Room 7',

  appearance:
    'Petite, freckled, copper-red hair cut short and usually damp. Oversized wool jumpers, a waterproof watch, salt ' +
    'stains on everything. Wears field boots to dinner. Bites her lip when calculating.',
  personality:
    'Literal, honest to a fault, socially clumsy and wildly enthusiastic about things nobody else notices. Doesn\'t ' +
    'understand flirting until three days later. Unexpectedly fearless in physical danger; terrified of parties.',
  background:
    'Postdoctoral researcher who lost her university funding last year. Margit Halloran privately paid for her to keep ' +
    'studying an unusual bioluminescent bloom in the hotel\'s cove — an arrangement nobody else knew about.',
  motivations: [
    'Finish the research before the cove is developed or the bloom disappears.',
    'Understand why Margit cared so much about it.',
    'Find out whether the funding still exists now that Margit is gone.',
  ],
  strengths: ['Brilliant observer', 'Cannot lie convincingly — so she doesn\'t', 'Calm in storms, literally'],
  weaknesses: ['Misses social cues', 'Hyperfocus makes her forget people', 'Distrusts anyone with money'],
  dialogueStyle:
    'Precise vocabulary, long sentences that branch into tangents, then abrupt short ones when she realises she\'s ' +
    'rambling ("Sorry. That was a lot of plankton."). Answers rhetorical questions literally.',
  arcNotes:
    'Arc: observation → participation. Her data shows the bloom appears where something on the seabed is leaking — ' +
    'possibly connected to what the developer actually wants. Romance grows through shared curiosity, not grand gestures.',

  initialRelationship: { affinity: 5, trust: 5 },
  poses: ['standing', 'notebook', 'wetsuit'],
  defaultPose: 'standing',
  expressions: EXPRESSIONS,
  profile: [
    { id: 'role', label: 'Role', text: 'Studies the cove. Lives in Room 7. Has opinions about plankton.' },
    { id: 'age', label: 'Age', text: '31' },
    {
      id: 'funding',
      label: 'Funding',
      text: 'Her research was paid for by Margit, privately.',
      unlockWhen: C.flag('june_funding_revealed'),
    },
    {
      id: 'theory',
      label: 'The cove',
      text: 'Thinks something under the old mooring is warming the mud and feeding the bloom — possibly something man-made.',
      unlockWhen: C.any(C.flag('june_mooring_hint'), C.flag('june_manmade_theory'), C.flag('june_knows_boat')),
    },
  ],
  milestones: [
    { id: 'the_glow', title: 'The Glow', description: 'June showed you the cove at night.' },
    { id: 'field_partner', title: 'Field Partner', description: 'You helped June collect samples in bad weather.' },
  ],
};
