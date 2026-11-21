import { EXPRESSIONS, type CharacterDefinition } from '@/types';
import { C } from '../story/dsl';

export const noor: CharacterDefinition = {
  id: 'noor',
  name: 'Noor Haddad',
  shortName: 'Noor',
  age: 26,
  role: 'major',
  romanceable: true,
  color: '#e8a87c',
  occupation: 'Bartender at the Low Tide, the Halcyon\'s bar',

  appearance:
    'Medium height, warm brown skin, dark curls usually stuffed under a knotted scarf. Gold hoop in one ear only — she ' +
    'lost the other "somewhere meaningful". Rolled-sleeve work shirts, a bar towel permanently over one shoulder, ' +
    'ink smudges on her fingers from writing lyrics on receipts.',
  personality:
    'Quick, teasing, generous, and much more perceptive than she lets on. Deflects anything serious with a joke, then ' +
    'circles back to it hours later when you have forgotten. Loves loudly; is terrified of being a disappointment.',
  background:
    'A songwriter who had a small label deal in the city at twenty-two, then watched it collapse. Came to Halcyon Point ' +
    'for a summer three years ago and never left. Margit let her play the bar\'s piano after closing.',
  motivations: [
    'Write something she is not ashamed of.',
    'Pay off a debt she has told no one about.',
    'Keep a promise she made to Margit on the last night anyone saw her.',
  ],
  strengths: ['Reads a room instantly', 'Makes strangers feel like regulars', 'Brave when it matters'],
  weaknesses: ['Avoids hard conversations', 'Self-sabotages near success', 'Keeps secrets "to protect people"'],
  dialogueStyle:
    'Fast, playful, lots of rhetorical questions and invented nicknames ("ferry boy/girl", "new money"). Drops the act ' +
    'abruptly when moved — short, quiet lines. Never uses real-world brand or celebrity references.',
  arcNotes:
    'Arc: performance → honesty. Saw Margit at the pier the night she vanished and promised not to tell. Her route is ' +
    'about the cost of keeping that promise. Her debt is owed to someone connected to the Aldane Group.',

  initialRelationship: { affinity: 20, trust: 10 },
  poses: ['bar', 'leaning', 'guitar'],
  defaultPose: 'bar',
  expressions: EXPRESSIONS,
  profile: [
    { id: 'role', label: 'Role', text: 'Runs the bar. Allegedly. Mostly runs her mouth.' },
    { id: 'age', label: 'Age', text: '26' },
    {
      id: 'music',
      label: 'Music',
      text: 'Writes songs on receipts. Has never played one for you.',
      unlockWhen: C.affinity('noor', { gte: 25 }),
    },
    {
      id: 'debt',
      label: 'The deal',
      text: 'Had a record deal at twenty-three. The label folded; the advance turned out to be a loan. She is still paying.',
      unlockWhen: C.milestone('noor', 'after_hours'),
    },
    {
      id: 'promise',
      label: 'March',
      text: 'Helped Margit with the ropes the night she disappeared, and promised to tell no one.',
      unlockWhen: C.flag('noor_confessed_march'),
    },
    {
      id: 'tank',
      label: 'N.H.',
      text: 'Margit paid off her debt, six hundred a month. In return, Noor kept the ELIN\'s tank full and asked no questions.',
      unlockWhen: C.flag('noor_told_payments'),
    },
  ],
  milestones: [
    { id: 'after_hours', title: 'After Hours', description: 'Noor played the piano for you after closing.' },
    { id: 'real_laugh', title: 'A Real Laugh', description: 'You made Noor laugh — the real one, not the bar one.' },
    { id: 'the_song', title: 'March', description: 'Noor played you the song she wrote about the night Margit went out.' },
  ],
};
