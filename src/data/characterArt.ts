import { byId } from '@/engine/content';
import type { CharacterArt } from '@/types';

/**
 * Visual identity per character. When final renders exist, set `basePath`
 * (e.g. '/assets/characters/vera') and export files as
 * `<basePath>/<pose>/<expression>.webp`. No story changes are needed.
 */
export const characterArt = byId<CharacterArt & { id: string }>(
  [
    {
      id: 'player',
      character: 'player',
      silhouette: { hair: 'short_wavy', hairColor: '#2b2320', skin: '#d9b99a', outfit: '#3d4a44', outfitAccent: '#59616a', height: 1.05, build: 1.1 },
    },
    {
      id: 'vera',
      character: 'vera',
      silhouette: { hair: 'bun', hairColor: '#cdbf9e', skin: '#e9d2c0', outfit: '#262c38', outfitAccent: '#3a4357', height: 1.04, build: 0.96 },
    },
    {
      id: 'noor',
      character: 'noor',
      silhouette: { hair: 'curls_scarf', hairColor: '#2a1d17', skin: '#b07a55', outfit: '#e6dccd', outfitAccent: '#c0763f', height: 0.98, build: 1 },
    },
    {
      id: 'june',
      character: 'june',
      silhouette: { hair: 'pixie', hairColor: '#b5562b', skin: '#f0d6c2', outfit: '#5c7a6f', outfitAccent: '#8fb3a5', height: 0.93, build: 0.95 },
    },
    {
      id: 'sienna',
      character: 'sienna',
      silhouette: { hair: 'bob', hairColor: '#1a1416', skin: '#d6a985', outfit: '#b08a63', outfitAccent: '#7d2734', height: 1.01, build: 0.97 },
    },
    {
      id: 'bram',
      character: 'bram',
      silhouette: { hair: 'bald_beard', hairColor: '#a8a29a', skin: '#6e4a32', outfit: '#3d4a52', outfitAccent: '#ddd6c8', height: 1.03, build: 1.18 },
    },
    {
      id: 'margit',
      character: 'margit',
      silhouette: { hair: 'pixie', hairColor: '#8d8f93', skin: '#e2c3a8', outfit: '#d9b23a', outfitAccent: '#6b6e72', height: 0.97, build: 0.9 },
    },
  ],
  'character art',
);
