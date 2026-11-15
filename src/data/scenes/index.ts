import { byId } from '@/engine/content';
import { c1Ferry } from './chapter1/01_ferry';
import { c1Harbour } from './chapter1/02_harbour';

export const scenes = byId([c1Ferry, c1Harbour], 'scene');
