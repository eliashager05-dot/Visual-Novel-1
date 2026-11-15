import { EXPRESSIONS, type CharacterDefinition } from '@/types';

/**
 * The player character. Named by the player (the name plate always shows that
 * name), but with a fixed look so he can appear in rendered shots. His id must
 * be `player`: that is the speaker id the script already uses for his lines.
 */
export const protagonist: CharacterDefinition = {
  id: 'player',
  name: 'The Protagonist',
  age: 25,
  role: 'protagonist',
  romanceable: false,
  color: '#f0dfb8',
  occupation: 'Sound engineer, out of work; owns 51% of the Halcyon',

  appearance:
    'Tall and lean, a little underfed. Dark, overgrown wavy hair that falls across his forehead, two days of stubble, ' +
    'hazel-green eyes with tired shadows under them. Pale from nine years in windowless studios. Studio headphones ' +
    'round his neck when he travels; a waxed field jacket that has seen better weather.',
  personality:
    'A listener. Dry, self-deprecating, slower to speak than the people around him and more observant than they ' +
    'expect. Kind by default, stubborn when cornered. Notices sounds before he notices faces.',
  background:
    'Mixed records in a city studio for nine years, until it closed and became flats. Met his great-aunt Margit once, ' +
    'at six. Arrives on the island with a duffel bag, no job, and 51% of a hotel he has never seen.',
  motivations: [
    'Find out why Margit chose him.',
    'Decide what to do with the Halcyon before the bank decides for him.',
    'Have somewhere, for once, that he does not want to leave.',
  ],
  strengths: ['Hears what others miss', 'Calm under pressure', 'Easy to talk to'],
  weaknesses: ['Drifts rather than decides', 'Deflects with jokes', 'Has nothing to go back to, and knows it'],
  dialogueStyle:
    'Short, dry, understated. Answers a beat late. Sound and music metaphors come naturally; he never explains them.',

  initialRelationship: { affinity: 0, trust: 0 },
  poses: ['standing', 'leaning', 'seated'],
  defaultPose: 'standing',
  expressions: EXPRESSIONS,
  profile: [],
  milestones: [],
};
