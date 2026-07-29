import { describe, it, expect } from 'vitest';
import { DiffService } from '../../../../src/domain/services/DiffService';

describe('DiffService', () => {
  const diff = new DiffService();

  it('returns unchanged when hashes match', () => {
    const result = diff.diff(
      {
        hash: 'a'.repeat(64),
        price: 200000,
        redFlags: [],
      },
      { hash: 'a'.repeat(64), price: 200000, redFlags: [] },
    );
    expect(result.unchanged).toBe(true);
  });

  it('detects price delta', () => {
    const result = diff.diff(
      { hash: 'a'.repeat(64), price: 200000, redFlags: [] },
      { hash: 'b'.repeat(64), price: 190000, redFlags: [] },
    );
    expect(result.unchanged).toBe(false);
    expect(result.priceDelta).toBe(-10000);
  });

  it('detects added and removed red flags', () => {
    const result = diff.diff(
      {
        hash: 'a'.repeat(64),
        redFlags: [
          { flag: 'euphemistic_language', severity: 'low', reasoning: 'old reasoning text here' },
        ],
      },
      {
        hash: 'b'.repeat(64),
        redFlags: [
          { flag: 'missing_energy_certificate', severity: 'medium', reasoning: 'new reasoning text here' },
        ],
      },
    );
    expect(result.removedRedFlags).toHaveLength(1);
    expect(result.addedRedFlags).toHaveLength(1);
  });
});
