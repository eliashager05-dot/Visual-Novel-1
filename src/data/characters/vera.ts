import { EXPRESSIONS, type CharacterDefinition } from '@/types';
import { C } from '../story/dsl';

export const vera: CharacterDefinition = {
  id: 'vera',
  name: 'Vera Lindqvist',
  shortName: 'Vera',
  age: 29,
  role: 'major',
  romanceable: true,
  color: '#9db4d6',
  occupation: 'General manager of the Halcyon Hotel',

  appearance:
    'Tall, straight-backed. Ash-blonde hair always pinned up; one strand escapes when she is tired. Grey-blue eyes, ' +
    'a faint scar through her left eyebrow. Dresses in charcoal and navy, sleeves rolled exactly twice. Reading glasses ' +
    'she denies needing.',
  personality:
    'Precise, dry, quietly funny once she stops guarding the door. Competence is her armour; she treats every problem ' +
    'as solvable by working harder. Deeply loyal, slow to forgive, and allergic to being pitied.',
  background:
    'Arrived on the island at nineteen with one bag and no plan. Margit Halloran hired her as a night porter, then ' +
    'taught her everything. Ten years later she runs the hotel in all but name — and Margit\'s will left her 49% of it. ' +
    'The other 51% went to a relative she has never met: the player.',
  motivations: [
    'Keep the Halcyon open — it is the only home she has ever chosen.',
    'Find out what Margit was doing in the weeks before she vanished.',
    'Prove she is not just "the help Margit took in".',
  ],
  strengths: ['Unflappable in a crisis', 'Remembers everything', 'Fiercely protective of her staff'],
  weaknesses: ['Cannot delegate', 'Mistakes control for safety', 'Turns grief into overwork'],
  dialogueStyle:
    'Short, complete sentences. Rarely uses contractions when annoyed. Humour is bone-dry and delivered without a smile. ' +
    'Uses the player\'s full name, like a guest\'s, until trust grows. ' +
    'Never swears in front of guests; swears in Swedish when alone.',
  arcNotes:
    'Arc: control → partnership. Early chapters she sees the player as the man/woman who will sell her home. The romance ' +
    'route asks her to let someone share the weight. Secret: she found a second set of books Margit kept and has not ' +
    'told anyone. Low trust routes end with her buying the player out or walking away.',

  initialRelationship: { affinity: 10, trust: 5 },
  poses: ['standing', 'arms_crossed', 'clipboard'],
  defaultPose: 'standing',
  expressions: EXPRESSIONS,
  tiers: [
    { min: 0, label: 'Wary co-owner' },
    { min: 20, label: 'Business partner' },
    { min: 40, label: 'Ally' },
    { min: 60, label: 'Confidante' },
    { min: 80, label: 'Something more' },
  ],
  profile: [
    { id: 'role', label: 'Role', text: 'Runs the Halcyon. Owns 49% of it.' },
    { id: 'age', label: 'Age', text: '29' },
    {
      id: 'margit',
      label: 'Margit',
      text: 'Margit hired her at nineteen. She speaks of her in the present tense when she forgets herself.',
      unlockWhen: C.affinity('vera', { gte: 20 }),
    },
    {
      id: 'swedish',
      label: 'Habit',
      text: 'Swears in Swedish when she thinks nobody is listening.',
      unlockWhen: C.flag('vera_heard_swearing'),
    },
    {
      id: 'books',
      label: 'The books',
      text: 'Found monthly payments in the hotel accounts marked "Under the tide". She has told no one but you.',
      unlockWhen: C.flag('saw_payments'),
    },
    {
      id: 'boat',
      label: 'The boat',
      text: 'Signed the form when the police took the ELIN to the mainland. She was there when it came back.',
      unlockWhen: C.flag('found_scarf'),
    },
    {
      id: 'swim',
      label: 'Swimming',
      text: 'Margit taught her to swim on the dry floor of an empty pool, then threw her in the cove. She swam out of spite.',
      unlockWhen: C.visited('c2_east_wing'),
    },
  ],
  milestones: [
    { id: 'first_truce', title: 'First Truce', description: 'You and Vera agreed not to make any decision about the hotel without each other.' },
    { id: 'night_shift', title: 'Night Shift', description: 'You covered the front desk so she could sleep. She noticed.' },
    { id: 'deep_end', title: 'The Deep End', description: 'You asked about Margit, not the money. Vera told you how she learned to swim.' },
    { id: 'missing_c', title: 'The Missing C', description: 'You fixed the sign Margit could never afford to.' },
  ],
};
