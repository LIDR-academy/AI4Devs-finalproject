import { describe, it, expect } from 'vitest';
import { bookingStatusBadgeClass } from '@/lib/bookingStatus';

describe('bookingStatusBadgeClass', () => {
  it('returns the shared pill base classes for confirmed', () => {
    const cls = bookingStatusBadgeClass('confirmed');
    expect(cls).toContain('rounded-pill');
    expect(cls).toContain('uppercase');
    expect(cls).toContain('tracking-wide');
    expect(cls).toContain('bg-terracotta-tint');
    expect(cls).toContain('text-terracotta');
  });

  it('returns the cancelled tokens', () => {
    const cls = bookingStatusBadgeClass('cancelled');
    expect(cls).toContain('border-border');
    expect(cls).toContain('text-taupe');
    expect(cls).toContain('bg-surface');
  });

  it('returns the completed tokens', () => {
    const cls = bookingStatusBadgeClass('completed');
    expect(cls).toContain('bg-canvas');
    expect(cls).toContain('text-taupe');
  });
});
