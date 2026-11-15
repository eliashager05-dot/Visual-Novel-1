import { content } from '@/data';
import { spriteSrc } from '@/lib/assetResolver';
import type { SaveThumb } from '@/engine';
import { SLOT_X, SPRITE_H, SPRITE_W } from '../CharacterRenderer/CharacterRenderer';
import { BackgroundImage } from './BackgroundLayer';
import { CgImage } from './CgLayer';
import { ImageWithFallback } from './ImageWithFallback';
import { PlaceholderCharacter } from './placeholders/PlaceholderCharacter';
import { ShotImage } from './ShotLayer';

/**
 * Static miniature of a saved stage, re-rendered from the save data rather
 * than captured — crisp at any size, and automatically shows final renders.
 */
export function StageThumbnail({ thumb, width }: { thumb: SaveThumb; width: number }) {
  const scale = width / 1920;
  return (
    <div className="relative overflow-hidden bg-neutral-900" style={{ width, height: 1080 * scale }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ width: 1920, height: 1080, transform: `scale(${scale})` }}>
        {thumb.cg ? (
          <CgImage id={thumb.cg} />
        ) : thumb.shot ? (
          <ShotImage id={thumb.shot} showBrief={false} />
        ) : (
          <>
            {thumb.background && <BackgroundImage id={thumb.background} />}
            {thumb.characters.map((c) => {
              const def = content.characters[c.id];
              const art = content.characterArt[c.id];
              if (!def || !art) return null;
              const s = 0.86 * art.silhouette.height;
              const w = SPRITE_W * s;
              const h = SPRITE_H * s;
              return (
                <div key={c.id} className="absolute" style={{ width: w, height: h, top: 1080 - h * 0.74, left: (1920 * SLOT_X[c.position]) / 100 - w / 2 }}>
                  <ImageWithFallback
                    src={spriteSrc(c.id, c.pose, c.expression)}
                    className="h-full w-full object-contain object-bottom"
                    fallback={<PlaceholderCharacter spec={art.silhouette} pose={c.pose} expression={c.expression} color={def.color} />}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
