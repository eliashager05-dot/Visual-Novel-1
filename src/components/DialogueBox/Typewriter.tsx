import { useEffect, useRef, useState } from 'react';

/**
 * Reveals text over time. The unrevealed remainder is rendered invisibly so the
 * layout never reflows while typing. Punctuation adds a short beat.
 * Remount (via `key`) for each new line.
 */
export function Typewriter({
  text,
  cps,
  instant,
  completeSignal,
  onDoneChange,
}: {
  text: string;
  /** Characters per second; 0 = instant. */
  cps: number;
  instant: boolean;
  /** When this number changes, reveal everything immediately. */
  completeSignal: number;
  /** Reports whether the full line is visible (false on every new line). */
  onDoneChange: (done: boolean) => void;
}) {
  const immediate = instant || cps <= 0;
  const cursor = useRef(immediate ? text.length : 0);
  const [shown, setShown] = useState(cursor.current);
  const initialSignal = useRef(completeSignal);
  const done = shown >= text.length;

  // Finish instantly when asked (click) or when skip mode turns on.
  useEffect(() => {
    if (immediate || completeSignal !== initialSignal.current) {
      cursor.current = text.length;
      setShown(text.length);
    }
  }, [immediate, completeSignal, text.length]);

  // Type with rAF using elapsed time, so dropped frames don't slow the text.
  useEffect(() => {
    if (cursor.current >= text.length) return;
    let raf = 0;
    let budget = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (cursor.current >= text.length) return; // completed externally
      budget += ((now - last) / 1000) * cps;
      last = now;
      while (budget >= 1 && cursor.current < text.length) {
        const ch = text[cursor.current]!;
        cursor.current++;
        budget -= /[.!?…—]/.test(ch) ? 7 : ch === ',' ? 3 : 1;
      }
      setShown(cursor.current);
      if (cursor.current < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, cps]);

  useEffect(() => {
    onDoneChange(done);
  }, [done, onDoneChange]);

  return (
    <>
      <span>{text.slice(0, shown)}</span>
      <span className="opacity-0" aria-hidden>
        {text.slice(shown)}
      </span>
    </>
  );
}
