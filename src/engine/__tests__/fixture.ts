import type { GameContent } from '../content';
import type { CharacterDefinition } from '@/types';
import { EXPRESSIONS } from '@/types';
import {
  affinity, bg, C, choice, end, hide, jump, label, milestone, narrate, option, scene, setFlag, show, speaker, when,
} from '@/data/story/dsl';

export const char = (id: string, age = 25): CharacterDefinition => ({
  id,
  name: id.toUpperCase(),
  age,
  role: 'major',
  romanceable: true,
  color: '#fff',
  occupation: '',
  appearance: '',
  personality: '',
  background: '',
  motivations: [],
  strengths: [],
  weaknesses: [],
  dialogueStyle: '',
  initialRelationship: { affinity: 10, trust: 0 },
  poses: ['standing'],
  defaultPose: 'standing',
  expressions: EXPRESSIONS,
  profile: [
    { id: 'basic', label: 'Basic', text: 'always' },
    { id: 'secret', label: 'Secret', text: 'hidden', unlockWhen: C.affinity(id, { gte: 30 }) },
  ],
  milestones: [{ id: 'm1', title: 'M1', description: 'd' }],
});

const art = (character: string) => ({
  character,
  silhouette: { hair: 'bob' as const, hairColor: '#000', skin: '#fff', outfit: '#333', outfitAccent: '#666', height: 1 },
});

const a = speaker('a');

export function makeFixture(): GameContent {
  return {
    defaultPlayerName: 'Default',
    characters: { a: char('a'), b: char('b') },
    characterArt: { a: art('a'), b: art('b') },
    chapters: [{ id: 'ch1', title: 'One', startScene: 's1' }],
    backgrounds: { room: { id: 'room', name: 'Room', placeholder: { palette: ['#000', '#111', '#222'] } } },
    cgs: {},
    shots: {},
    contacts: { unknown: { id: 'unknown', name: 'Unknown number', color: '#999' } },
    music: {},
    sfx: {},
    scenes: {
      s1: scene('s1', 'ch1', 'Start', [
        bg('room'),
        show('a', { position: 'left', expression: 'happy' }),
        a('Hello, {player}.', 'happy'),
        choice('c1', [
          option('kind', 'Be kind', {
            effects: [affinity('a', 25), milestone('a', 'm1')],
            steps: [a('Thanks!', 'laughing')],
          }),
          option('rude', 'Be rude', { effects: [affinity('a', -50), setFlag('was_rude')] }),
          option('secret', 'Secret', { condition: C.flag('never'), showWhenLocked: true, lockedHint: 'nope' }),
          option('hidden', 'Hidden', { condition: C.flag('never') }),
          option('leave', 'Leave', { goto: { scene: 's2', label: 'late' } }),
        ]),
        when(C.affinity('a', { gte: 30 }), [narrate('She likes you.')], [narrate('She is unsure.')]),
        hide('a'),
        jump('s2'),
      ]),
      s2: scene('s2', 'ch1', 'Second', [
        narrate('Scene two start.'),
        label('late'),
        narrate('Late label.'),
        end({ ending: 'demo' }),
      ]),
    },
  };
}
