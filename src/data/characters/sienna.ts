import { EXPRESSIONS, type CharacterDefinition } from '@/types';
import { C } from '../story/dsl';

export const sienna: CharacterDefinition = {
  id: 'sienna',
  name: 'Sienna Marlowe',
  shortName: 'Sienna',
  age: 33,
  role: 'major',
  romanceable: true,
  color: '#d48aa6',
  occupation: 'Head of acquisitions, Aldane Group',

  appearance:
    'Dark hair in a sharp bob, olive skin, deep red lipstick that never smudges. Tailored camel coat, silk blouses, ' +
    'heels she somehow walks in on cobblestones. A cheap thread bracelet on her wrist that does not match anything.',
  personality:
    'Charming, strategic, warm in a way that might be technique and might be real — she isn\'t always sure herself. ' +
    'Enjoys a sparring partner. Hates being underestimated and hates being figured out even more.',
  background:
    'Grew up on Halcyon Point, the daughter of a fisherman who lost everything in a bad year. Left at eighteen and ' +
    'swore never to be poor again. Now she is back, representing the company that wants to buy the hotel and the cove.',
  motivations: [
    'Close the Halcyon deal — her promotion depends on it.',
    'Prove to the island that leaving was the right choice.',
    'Something personal about Margit she won\'t name.',
  ],
  strengths: ['Reads people like contracts', 'Persuasive', 'Knows the island\'s history better than anyone her age'],
  weaknesses: ['Treats every relationship as a negotiation', 'Pride', 'Can\'t admit she misses home'],
  dialogueStyle:
    'Smooth and unhurried. Answers questions with questions. Uses the player\'s name often, deliberately. When ' +
    'genuinely rattled, slips into island slang she otherwise avoids.',
  arcNotes:
    'Arc: transaction → loyalty. Margit once paid her father\'s debts anonymously; Sienna found out too late to thank ' +
    'her. Not a villain — but Aldane is not what she has been told, and she will have to choose.',

  initialRelationship: { affinity: 15, trust: 0 },
  poses: ['standing', 'coat', 'leaning'],
  defaultPose: 'standing',
  expressions: EXPRESSIONS,
  tiers: [
    { min: 0, label: 'Opposing party' },
    { min: 20, label: 'Friendly rival' },
    { min: 40, label: 'Off the record' },
    { min: 60, label: 'Trusted' },
    { min: 80, label: 'Something more' },
  ],
  profile: [
    { id: 'role', label: 'Role', text: 'Wants to buy the Halcyon. Very politely.' },
    { id: 'age', label: 'Age', text: '33' },
    {
      id: 'local',
      label: 'Roots',
      text: 'Grew up on the island. Doesn\'t like to talk about it.',
      unlockWhen: C.flag('sienna_is_local'),
    },
    {
      id: 'aldane',
      label: 'Aldane',
      text: 'Has closed eleven deals for them. This is the first time she has been told not to ask why.',
      unlockWhen: C.flag('sienna_off_record'),
    },
    {
      id: 'lights',
      label: 'The storm',
      text: 'Saw a boat\'s lights out past the cove at half seven, in the worst of the storm.',
      unlockWhen: C.flag('sienna_saw_lights'),
    },
  ],
  milestones: [
    { id: 'off_record', title: 'Off the Record', description: 'Sienna told you something her employers wouldn\'t like.' },
    { id: 'bracelet', title: 'The Bracelet', description: 'You asked about the thread bracelet. She answered honestly.' },
  ],
};
