"use client";

import { useEffect, useState } from "react";

type RateLimitCountdownProps = {
  retryAt: number;
  onExpire?: () => void;
};

export function RateLimitCountdown({ retryAt, onExpire }: RateLimitCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000));
      setSecondsLeft(next);
      if (next === 0) {
        window.clearInterval(id);
        onExpire?.();
      }
    }, 1000);

    return () => window.clearInterval(id);
  }, [onExpire, retryAt]);

  return (
    <p className="text-sm text-amber-800">
      Rate limit exceeded. Retry in <span className="font-semibold">{secondsLeft}s</span>.
    </p>
  );
}
