import type { AchievementDefinition } from '@/engine/achievements';
import { C } from './story/dsl';

/** Achievements for Chapter One. Add more per chapter; nothing else needs to change. */
export const achievements: AchievementDefinition[] = [
  { id: 'arrived', title: 'Halcyon Point', description: 'Step off the ferry.', rule: { kind: 'scenesSeen', scenes: ['c1_harbour'] } },
  { id: 'ch1_done', title: 'Low Tide', description: 'Finish Chapter One.', rule: { kind: 'chapterComplete', chapter: 'ch1' } },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Spend the first night in every possible way (over several playthroughs).',
    rule: { kind: 'scenesSeen', scenes: ['c1_night_vera', 'c1_night_noor', 'c1_night_june', 'c1_night_letter'] },
  },
  {
    id: 'both_sides',
    title: 'Both Sides of the Island',
    description: 'Spend the second afternoon with Sienna and, in another playthrough, with June.',
    rule: { kind: 'scenesSeen', scenes: ['c1_sienna_drive', 'c1_june_lowtide'] },
  },
  { id: 'plumber', title: 'Licensed and Insured', description: 'Let June believe you are the plumber.', rule: { kind: 'condition', condition: C.flag('june_plumber_joke') } },
  { id: 'ghost_chair', title: 'Somebody Has To', description: "Sit in Margit's chair.", rule: { kind: 'condition', condition: C.flag('sat_in_margit_chair') } },
  { id: 'partners', title: 'Partners', description: 'Make a pact with Vera.', rule: { kind: 'condition', condition: C.milestone('vera', 'first_truce') } },
  { id: 'night_shift', title: 'Night Shift', description: 'Send Vera to bed and watch the desk yourself.', rule: { kind: 'condition', condition: C.milestone('vera', 'night_shift') } },
  { id: 'one_more_second', title: 'One More Second', description: 'Earn Vera\'s trust before the storm.', hidden: true, rule: { kind: 'condition', condition: C.flag('vera_moment') } },
  { id: 'after_hours', title: 'After Hours', description: 'Hear Noor play.', rule: { kind: 'condition', condition: C.milestone('noor', 'after_hours') } },
  { id: 'you_asked', title: 'You Asked', description: 'Ask before you kiss.', hidden: true, rule: { kind: 'condition', condition: C.flag('asked_to_kiss_noor') } },
  { id: 'march', title: 'The Promise', description: 'Learn what Noor has been keeping since March.', hidden: true, rule: { kind: 'condition', condition: C.flag('noor_confessed_march') } },
  { id: 'bloom', title: 'Bloom', description: 'See the cove glow.', rule: { kind: 'condition', condition: C.milestone('june', 'the_glow') } },
  { id: 'field_partner', title: 'Field Partner', description: 'Hold June\'s ladder through the low tide.', rule: { kind: 'condition', condition: C.milestone('june', 'field_partner') } },
  { id: 'bracelet', title: 'Fishing Line', description: 'Ask Sienna about her bracelet.', rule: { kind: 'condition', condition: C.milestone('sienna', 'bracelet') } },
  { id: 'off_record', title: 'Off the Record', description: 'Hear what Sienna\'s employers would rather you did not.', hidden: true, rule: { kind: 'condition', condition: C.milestone('sienna', 'off_record') } },
  {
    id: 'under_the_tide',
    title: 'Under the Tide',
    description: "Connect the hotel's secret payments to Margit's own ledger.",
    hidden: true,
    rule: { kind: 'condition', condition: C.all(C.flag('saw_payments'), C.flag('found_margit_ledger')) },
  },
  {
    id: 'everyones_friend',
    title: 'Everyone\'s Friend',
    description: 'Reach affinity 30 with Vera, Noor, June and Sienna in one playthrough.',
    rule: {
      kind: 'condition',
      condition: C.all(
        C.affinity('vera', { gte: 30 }),
        C.affinity('noor', { gte: 30 }),
        C.affinity('june', { gte: 30 }),
        C.affinity('sienna', { gte: 30 }),
      ),
    },
  },
];
