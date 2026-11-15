import { useState, type ReactNode } from 'react';
import type { VideoAsset } from '@/lib/assetIndex';
import { useSettings } from '@/store/settingsStore';
import { ImageWithFallback } from './ImageWithFallback';

/**
 * Plays a clip if there is one (and animations are on), with the still as its
 * poster so there is never a blank frame. If the clip cannot play — wrong
 * codec, broken file — it quietly falls back to the still, then the placeholder.
 */
export function MediaWithFallback({
  video,
  src,
  fallback,
  className,
  alt = '',
  stillOnly = false,
}: {
  video: VideoAsset | null;
  src: string | null;
  fallback: ReactNode;
  className?: string;
  alt?: string;
  /** Thumbnails and grids always show the still. */
  stillOnly?: boolean;
}) {
  const animations = useSettings((s) => s.animations);
  const [failed, setFailed] = useState<string | null>(null);

  if (!video || stillOnly || !animations || failed === video.url) {
    return <ImageWithFallback src={src} fallback={fallback} className={className} alt={alt} />;
  }
  return (
    <video
      key={video.url}
      src={video.url}
      poster={src ?? undefined}
      className={className}
      aria-label={alt}
      autoPlay
      muted
      playsInline
      loop={video.loop}
      preload="auto"
      disablePictureInPicture
      onError={() => setFailed(video.url)}
    />
  );
}
