import { content } from '@/data';
import type { DisplayedLine } from '@/types';

export function speakerColor(line: Pick<DisplayedLine, 'speaker'>): string {
  if (!line.speaker || line.speaker === 'player') return '#e9e4da';
  return content.characters[line.speaker]?.color ?? '#e9e4da';
}
