import type { CharacterDefinition } from '@/types';
import { C } from '../story/dsl';

/**
 * Margit Halloran: the protagonist's great-aunt, who left them 51% of the
 * Halcyon and was presumed lost at sea in March. Seen in person for the first
 * time at the end of Chapter Two.
 */
export const margit: CharacterDefinition = {
  id: 'margit',
  name: 'Margit Halloran',
  shortName: 'Margit',
  age: 68,
  role: 'supporting',
  romanceable: false,
  color: '#e3c25a',
  occupation: 'Owner of the Halcyon for forty years. Officially missing at sea.',
  appearance:
    'Wiry and weather-beaten, cropped iron-grey hair, sharp pale-blue eyes in a face creased by wind. A yellow oilskin ' +
    'over a darned grey fisherman\'s jumper. Smells of pipe tobacco and diesel.',
  personality:
    'Formidable, funny, impatient with fools and with herself. Decides first and explains much later, if at all. ' +
    'Loves people by protecting them, which they do not always thank her for.',
  background:
    'Took over the Halcyon at twenty-eight and kept it open through forty winters out of stubbornness. Took in a ' +
    'nineteen-year-old night porter called Vera and never once told her how proud she was.',
  motivations: ['Keep the cove out of Aldane\'s hands', 'Keep the people she loves out of it'],
  strengths: ['Knows the sea and the island better than anyone alive', 'Unafraid'],
  weaknesses: ['Secretive to the point of cruelty', 'Thinks she has to carry everything alone'],
  dialogueStyle: 'Blunt, short, sailor\'s turns of phrase. Calls the protagonist "boy" until she decides otherwise.',
  initialRelationship: { affinity: 10, trust: 0 },
  poses: ['standing'],
  defaultPose: 'standing',
  expressions: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'worried', 'laughing'],
  profile: [
    { id: 'role', label: 'Role', text: 'Owned the Halcyon. Left you 51% of it. Presumed lost at sea in March.' },
    { id: 'alive', label: 'Slack water', text: 'Not lost. Hiding in the sea cave under the east wing, running a pump older than the hotel\'s lifts.', unlockWhen: C.visited('c2_slack_water') },
  ],
  milestones: [],
};
