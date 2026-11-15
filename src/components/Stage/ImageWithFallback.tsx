import { useState, type ReactNode } from 'react';

/** Shows `src` if it loads; otherwise (or if absent) renders the fallback placeholder. */
export function ImageWithFallback({
  src,
  fallback,
  className,
  alt = '',
}: {
  src: string | null;
  fallback: ReactNode;
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) return <>{fallback}</>;
  return <img src={src} alt={alt} className={className} draggable={false} onError={() => setFailed(src)} />;
}
