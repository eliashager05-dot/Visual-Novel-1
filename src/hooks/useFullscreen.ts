import { useCallback, useEffect, useState } from 'react';

export function useFullscreen() {
  const [isFullscreen, setFs] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement);
  useEffect(() => {
    const on = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggle = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      // Browsers may refuse (iframes, iOS); the button simply has no effect there.
    }
  }, []);
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled;
  return { isFullscreen, toggle, supported };
}
