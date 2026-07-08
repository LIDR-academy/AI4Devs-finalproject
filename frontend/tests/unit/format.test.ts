import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  scoreColor,
  scoreLabelEs,
} from '../../src/lib/utils/format';

describe('formatCurrency', () => {
  it('formats EUR with Spanish locale by default', () => {
    const result = formatCurrency(1234.56);
    // Intl formats vary by Node version, just check it contains the digits
    expect(result).toMatch(/1[\.,\s]?234/);
    expect(result).toMatch(/56/);
  });
  it('accepts a custom currency', () => {
    const result = formatCurrency(100, 'USD', 'en-US');
    expect(result).toContain('$');
  });
});

describe('formatDate', () => {
  it('formats ISO string to medium date', () => {
    const result = formatDate('2026-07-08T12:00:00Z');
    expect(result).toMatch(/8/);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('scoreColor', () => {
  it('returns success for high scores', () => {
    expect(scoreColor(85)).toContain('success');
  });
  it('returns warning for mid scores', () => {
    expect(scoreColor(60)).toContain('warning');
  });
  it('returns danger for low scores', () => {
    expect(scoreColor(30)).toContain('danger');
  });
});

describe('scoreLabelEs', () => {
  it('returns "Excelente" for >= 90', () => {
    expect(scoreLabelEs(95)).toBe('Excelente');
  });
  it('returns "Alta" for 70-89', () => {
    expect(scoreLabelEs(75)).toBe('Alta');
  });
  it('returns "Media" for 50-69', () => {
    expect(scoreLabelEs(55)).toBe('Media');
  });
  it('returns "Baja" for < 50', () => {
    expect(scoreLabelEs(30)).toBe('Baja');
  });
});
