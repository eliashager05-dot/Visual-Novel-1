import type { GameContent } from '@/engine/content';
import { backgrounds, cgs, music, sfx } from './assets';
import { characterArt } from './characterArt';
import { characters } from './characters';
import { contacts } from './contacts';
import { maps } from './maps';
import { scenes } from './scenes';
import { shots } from './shots';
import { chapters } from './story/chapters';

export const content: GameContent = {
  characters,
  characterArt,
  scenes,
  chapters,
  backgrounds,
  cgs,
  shots,
  contacts,
  maps,
  music,
  sfx,
  defaultPlayerName: 'Rowan',
};
