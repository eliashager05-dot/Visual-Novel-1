import type { GameContent } from '@/engine/content';
import { backgrounds, cgs, music, sfx } from './assets';
import { characterArt } from './characterArt';
import { characters } from './characters';
import { scenes } from './scenes';
import { chapters } from './story/chapters';

export const content: GameContent = {
  characters,
  characterArt,
  scenes,
  chapters,
  backgrounds,
  cgs,
  music,
  sfx,
  defaultPlayerName: 'Rowan',
};
