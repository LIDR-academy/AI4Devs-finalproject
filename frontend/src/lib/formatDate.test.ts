import { describe, it, expect } from 'vitest';
import { formatDate, formatDateRange } from './formatDate';

describe('formatDate', () => {
  it('formats a single ISO date as "D Mon YYYY" (en-GB)', () => {
    expect(formatDate('2030-06-10')).toBe('10 Jun 2030');
    expect(formatDate('2030-06-13')).toBe('13 Jun 2030');
  });
});

describe('formatDateRange', () => {
  it('formats a same-month range with the year collapsed to the end', () => {
    expect(formatDateRange('2026-07-10', '2026-07-13')).toBe('Jul 10 – Jul 13, 2026');
  });

  it('formats a cross-month range', () => {
    expect(formatDateRange('2026-07-31', '2026-08-02')).toBe('Jul 31 – Aug 2, 2026');
  });

  it('formats a cross-year range using the check-out year', () => {
    expect(formatDateRange('2026-12-30', '2027-01-02')).toBe('Dec 30 – Jan 2, 2027');
  });

  it('returns an empty string when either date is missing', () => {
    expect(formatDateRange('', '')).toBe('');
  });
});
