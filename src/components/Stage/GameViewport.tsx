import { useEffect, useState, type ReactNode } from 'react';

export const DESIGN_W = 1920;
export const DESIGN_H = 1080;

/**
 * Everything is laid out on a fixed 1920×1080 canvas and uniformly scaled to
 * fit the window (letterboxed). Pixel values in components are therefore
 * "1080p pixels" and look identical at every resolution.
 */
export function GameViewport({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black">
      <div style={{ width: DESIGN_W * scale, height: DESIGN_H * scale }} className="relative">
        <div
          className="absolute left-0 top-0 origin-top-left overflow-hidden bg-black select-none"
          style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
