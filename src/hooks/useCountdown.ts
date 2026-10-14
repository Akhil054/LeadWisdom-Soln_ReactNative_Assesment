import { useEffect, useState } from 'react';

export interface Countdown {
  /** Milliseconds left until the target (negative once overdue). */
  remainingMs: number;
  isOverdue: boolean;
  /** 0 → 1 progress of the booked window. */
  progress: number;
}

/**
 * Ticks every second. Derives time from the wall clock (not by decrementing a
 * counter), so it stays accurate after the app was backgrounded.
 */
export const useCountdown = (startIso?: string, endIso?: string): Countdown => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!endIso) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endIso]);

  if (!startIso || !endIso) return { remainingMs: 0, isOverdue: false, progress: 0 };

  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  const remainingMs = end - now;
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  return { remainingMs, isOverdue: remainingMs < 0, progress };
};
