import { useEffect, useState } from 'react';

export interface Countdown {
  /** Milliseconds left until the target (negative once overdue). */
  remainingMs: number;
  /** Milliseconds since the start (never negative). */
  elapsedMs: number;
  isOverdue: boolean;
  /** 0 → 1 progress of the booked window. */
  progress: number;
}

/** Ticks every second and computes remaining / elapsed time of the trip. */
export const useCountdown = (startIso?: string, endIso?: string): Countdown => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!endIso) return;
    const tick = () => setNow(Date.now());
    // Sync immediately (state may be stale from before this rental), then every second.
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [endIso]);

  if (!startIso || !endIso) return { remainingMs: 0, elapsedMs: 0, isOverdue: false, progress: 0 };

  const start = Date.parse(startIso);
  const end = Date.parse(endIso);
  const remainingMs = end - now;
  const elapsedMs = Math.max(0, now - start);
  const progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  return { remainingMs, elapsedMs, isOverdue: remainingMs < 0, progress };
};
