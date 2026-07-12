import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HoldCountdownBanner } from './HoldCountdownBanner';

// --------------------------------------------------------------------------
// Fixtures
// --------------------------------------------------------------------------

/** Returns a future timestamp `s` seconds from now. */
const futureExpiry = (s = 600): string => new Date(Date.now() + s * 1000).toISOString();

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('HoldCountdownBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the banner with hold-countdown and countdown-timer testids', () => {
    render(<HoldCountdownBanner holdExpiresAt={futureExpiry()} onHoldExpired={vi.fn()} />);
    expect(screen.getByTestId('hold-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
  });

  it('displays correct initial countdown for a 10-minute hold', () => {
    render(<HoldCountdownBanner holdExpiresAt={futureExpiry(600)} onHoldExpired={vi.fn()} />);
    const timerText = screen.getByTestId('countdown-timer').textContent ?? '';
    expect(timerText).toMatch(/^9:\d{2}$|^10:00$/);
  });

  it('calls onHoldExpired when the hold elapses', () => {
    const onExpired = vi.fn();
    render(<HoldCountdownBanner holdExpiresAt={futureExpiry(2)} onHoldExpired={onExpired} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onExpired).toHaveBeenCalled();
  });

  it('sets data-urgent="true" when under 120s remain', () => {
    render(<HoldCountdownBanner holdExpiresAt={futureExpiry(60)} onHoldExpired={vi.fn()} />);
    expect(screen.getByTestId('hold-countdown')).toHaveAttribute('data-urgent', 'true');
  });

  it('sets data-urgent="false" when more than 120s remain', () => {
    render(<HoldCountdownBanner holdExpiresAt={futureExpiry(300)} onHoldExpired={vi.fn()} />);
    expect(screen.getByTestId('hold-countdown')).toHaveAttribute('data-urgent', 'false');
  });

  it('uses editorial terracotta styling and reserved-spot copy', () => {
    render(<HoldCountdownBanner holdExpiresAt={futureExpiry()} onHoldExpired={vi.fn()} />);
    expect(screen.getByTestId('hold-countdown').className).toContain('bg-terracotta');
    expect(screen.getByText(/spot reserved/i)).toBeInTheDocument();
  });
});
