import { byId } from '@/engine/content';
import { c1Ferry } from './chapter1/01_ferry';
import { c1Harbour } from './chapter1/02_harbour';
import { c1Hotel } from './chapter1/03_hotel';
import { c1Corridor } from './chapter1/04_corridor';
import { c1Dinner } from './chapter1/05_dinner';
import { c1LowTide } from './chapter1/06_low_tide';
import { c1FirstNight, c1NightJune, c1NightLetter, c1NightNoor, c1NightVera } from './chapter1/07_first_night';
import { c1Morning } from './chapter1/08_morning';
import { c1JuneLowTide, c1SiennaDrive } from './chapter1/09_afternoon';
import { c1Dusk } from './chapter1/09b_dusk';
import { c1Aftermath, c1Storm } from './chapter1/10_storm';
import { c1Cliffhanger, c1MargitRoom } from './chapter1/11_ending';

export const scenes = byId([c1Ferry, c1Harbour, c1Hotel, c1Corridor, c1Dinner, c1LowTide, c1FirstNight, c1NightVera, c1NightNoor, c1NightJune, c1NightLetter, c1Morning, c1SiennaDrive, c1JuneLowTide, c1Dusk, c1Storm, c1Aftermath, c1MargitRoom, c1Cliffhanger], 'scene');
