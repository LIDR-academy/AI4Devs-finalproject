import { describe, it, expect } from 'vitest';
import { FinancialProfile } from '../../../../src/domain/value-objects/FinancialProfile';

describe('FinancialProfile.interestRate', () => {
  it('round-trips interestRate through create and toJSON', () => {
    const profile = FinancialProfile.create({
      savings: 45_000,
      monthlyIncome: 3_500,
      existingDebts: 0,
      region: 'Madrid',
      interestRate: 0.035,
    });
    expect(profile.interestRate).toBe(0.035);
    expect(profile.toJSON().interestRate).toBe(0.035);
  });

  it('defaults interestRate to null when omitted', () => {
    const profile = FinancialProfile.create({
      savings: 45_000,
      monthlyIncome: 3_500,
      existingDebts: 0,
      region: 'Madrid',
    });
    expect(profile.interestRate).toBeNull();
    expect(profile.toJSON().interestRate).toBeNull();
  });

  it('rejects negative interestRate', () => {
    expect(() =>
      FinancialProfile.create({
        savings: 0,
        monthlyIncome: 0,
        existingDebts: 0,
        region: 'Madrid',
        interestRate: -0.01,
      }),
    ).toThrow();
  });
});
