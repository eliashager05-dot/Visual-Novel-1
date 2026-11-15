import { content } from '@/data';
import { spriteSrc } from '@/lib/assetResolver';
import type { Expression } from '@/types';
import { ImageWithFallback } from '../Stage/ImageWithFallback';
import { PlaceholderCharacter } from '../Stage/placeholders/PlaceholderCharacter';

/** Head-and-shoulders crop of a character's sprite (or placeholder). */
export function CharacterPortrait({ id, expression = 'neutral', size }: { id: string; expression?: Expression; size: number }) {
  const def = content.characters[id];
  const art = content.characterArt[id];
  if (!def || !art) return null;
  // The art box is 600×1500 with the head centred near y≈212; show y≈60–560.
  const scale = size / 500;
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-white/[0.06] to-black/40" style={{ width: size, height: size }}>
      <div className="absolute" style={{ width: 600 * scale, height: 1500 * scale, left: (size - 600 * scale) / 2, top: -60 * scale }}>
        <ImageWithFallback
          src={spriteSrc(id, def.defaultPose, expression)}
          className="h-full w-full object-contain object-top"
          fallback={<PlaceholderCharacter spec={art.silhouette} pose="standing" expression={expression} color={def.color} />}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}
