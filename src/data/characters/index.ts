import { byId } from '@/engine/content';
import { june } from './june';
import { noor } from './noor';
import { sienna } from './sienna';
import { bram } from './supporting';
import { vera } from './vera';

/** Register new characters here — nothing else in the engine needs to change. */
export const characters = byId([vera, noor, june, sienna, bram], 'character');
