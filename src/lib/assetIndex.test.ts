import { describe, expect, it } from 'vitest';
import { indexAssets, videoId } from './assetIndex';

describe('asset index', () => {
  const idx = indexAssets({
    '/src/assets/shots/c1_a.png': '/u/a.png',
    '/src/assets/shots/c1_a.mp4': '/u/a.mp4',
    '/src/assets/shots/c1_b.once.webm': '/u/b.webm',
    '/src/assets/shots/c1_c.webp': '/u/c.webp',
    '/src/assets/cg/cg_x.mp4': '/u/x.mp4',
    '/src/assets/characters/vera/standing/happy.webp': '/u/v.webp',
    '/src/assets/shots/notes.txt': '/u/n.txt',
  });

  it('finds stills by id regardless of extension', () => {
    expect(idx.images.get('shots/c1_a')).toBe('/u/a.png');
    expect(idx.images.get('shots/c1_c')).toBe('/u/c.webp');
    expect(idx.images.get('characters/vera/standing/happy')).toBe('/u/v.webp');
  });

  it('finds clips, looping by default and once with ".once"', () => {
    expect(idx.videos.get('shots/c1_a')).toEqual({ url: '/u/a.mp4', loop: true });
    expect(idx.videos.get('shots/c1_b')).toEqual({ url: '/u/b.webm', loop: false });
    expect(idx.videos.get('cg/cg_x')).toEqual({ url: '/u/x.mp4', loop: true });
  });

  it('keeps a clip and a still for the same id side by side', () => {
    expect(idx.images.has('shots/c1_a')).toBe(true);
    expect(idx.videos.has('shots/c1_a')).toBe(true);
  });

  it('ignores other files', () => {
    expect([...idx.images.keys(), ...idx.videos.keys()].some((k) => k.includes('notes'))).toBe(false);
  });

  it('maps video file names back to their id', () => {
    expect(videoId('c1_a.mp4')).toBe('c1_a');
    expect(videoId('c1_b.once.webm')).toBe('c1_b');
    expect(videoId('c1_c.png')).toBeNull();
  });
});
