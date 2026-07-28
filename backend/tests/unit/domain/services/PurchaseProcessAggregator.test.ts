import { describe, it, expect } from 'vitest';
import { PurchaseProcessAggregator } from '../../../../src/domain/services/PurchaseProcessAggregator';
import { FinancialProfile } from '../../../../src/domain/value-objects/FinancialProfile';

const profile = FinancialProfile.create({
  savings: 45_000,
  monthlyIncome: 3_500,
  existingDebts: 0,
  region: 'Madrid',
  persona: 'equilibrado',
  interestRate: 0.035,
});

describe('PurchaseProcessAggregator', () => {
  const agg = new PurchaseProcessAggregator();

  it('returns null when no propertyPrice', () => {
    expect(agg.compute(null, profile)).toBeNull();
  });

  it('returns hidden costs + 4 amortization + 3 investment scenarios', () => {
    const result = agg.compute(200_000, profile);
    expect(result).not.toBeNull();
    expect(result!.hiddenCosts.total).toBeGreaterThan(0);
    expect(result!.amortizationScenarios).toHaveLength(4);
    expect(result!.amortizationScenarios[0].name).toBe('Sin amortizar');
    expect(result!.amortizationScenarios[1].name).toContain('cuota');
    expect(result!.amortizationScenarios[2].name).toContain('cuota');
    expect(result!.amortizationScenarios[3].name).toContain('cuota');
    expect(result!.investmentScenarios).toHaveLength(3);
    expect(result!.investmentScenarios.map((s) => s.name)).toEqual([
      'conservador (4%)', 'moderado (6%)', 'agresivo (8%)',
    ]);
  });

  it('computes loan amount and monthly payment (propertyPrice - savings)', () => {
    const result = agg.compute(200_000, profile);
    expect(result!.loanAmount).toBe(155_000);
    const baseline = result!.amortizationScenarios[0];
    expect(baseline.monthlyPayment).toBeGreaterThan(600);
    expect(baseline.monthlyPayment).toBeLessThan(750);
  });

  it('totalCash = propertyPrice + hiddenCosts.total', () => {
    const result = agg.compute(200_000, profile);
    expect(result!.totalCash).toBe(200_000 + result!.hiddenCosts.total);
  });

  it('gap = savings - totalCash (negative when short)', () => {
    const result = agg.compute(200_000, profile);
    expect(result!.gap).toBe(45_000 - result!.totalCash);
  });
});
