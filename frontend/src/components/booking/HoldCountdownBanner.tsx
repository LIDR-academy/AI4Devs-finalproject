'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/** Returns whole seconds remaining from a future ISO 8601 timestamp (>= 0). */
function secondsRemaining(expiresAt: string): number {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

export interface HoldCountdownBannerProps {
  holdExpiresAt: string;
  onHoldExpired: () => void;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

/**
 * HoldCountdownBanner (editorial restyle, T4)
 *
 * Full-width terracotta banner shown at the top of the checkout page. Owns the
 * booking-hold countdown timer and the `onHoldExpired` callback (the expiry
 * redirect flow). Promoted out of BookingSummary's small in-card box.
 */
export function HoldCountdownBanner({ holdExpiresAt, onHoldExpired }: HoldCountdownBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(() => secondsRemaining(holdExpiresAt));

  // Countdown timer — updates every second
  useEffect(() => {
    if (secondsLeft <= 0) {
      onHoldExpired();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          onHoldExpired();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount; onHoldExpired captured via closure update below

  // Re-sync if holdExpiresAt changes (e.g. hold refreshed)
  useEffect(() => {
    setSecondsLeft(secondsRemaining(holdExpiresAt));
  }, [holdExpiresAt]);

  const urgent = secondsLeft < 120;

  return (
    <div
      className={`w-full text-white ${urgent ? 'bg-[#6f2a17]' : 'bg-terracotta'}`}
      data-testid="hold-countdown"
      data-urgent={urgent}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm tracking-wide">
        <Clock className="w-4 h-4" aria-hidden />
        <span className="uppercase font-medium">
          SPOT RESERVED — RESERVATION EXPIRES IN{' '}
          <span
            className={`tabular-nums font-semibold${urgent ? ' animate-pulse' : ''}`}
            data-testid="countdown-timer"
          >
            {formatCountdown(secondsLeft)}
          </span>
        </span>
      </div>
    </div>
  );
}
