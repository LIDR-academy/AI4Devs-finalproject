import { describe, it, expect } from 'vitest';
import { AmortizationCalculator } from '../../../../src/domain/services/AmortizationCalculator';

describe('AmortizationCalculator', () => {
  const calc = new AmortizationCalculator();

  it('computes baseline 30yr mortgage', () => {
    const scenario = calc.amortize({
      principal: 160_000,
      annualRate: 0.035,
      years: 30,
      monthlyExtra: 0,
    });
    expect(scenario.name).toBe('Sin amortizar');
    expect(scenario.monthlyPayment).toBeGreaterThan(700);
    expect(scenario.monthlyPayment).toBeLessThan(800);
    expect(scenario.totalInterest).toBeGreaterThan(0);
  });

  it('reduces years with extra payments', () => {
    const baseline = calc.amortize({ principal: 160_000, annualRate: 0.035, years: 30, monthlyExtra: 0 });
    const aggressive = calc.amortize({ principal: 160_000, annualRate: 0.035, years: 30, monthlyExtra: 500 });
    expect(aggressive.yearsToPayoff).toBeLessThan(baseline.yearsToPayoff);
    expect(aggressive.totalInterest).toBeLessThan(baseline.totalInterest);
  });

  it('generates 4 scenarios', () => {
    const all = calc.generateAllScenarios({ principal: 160_000, annualRate: 0.035, years: 30 });
    expect(all).toHaveLength(4);
    expect(all[0].name).toBe('Sin amortizar');
    expect(all[1].name).toContain('cuota');
    expect(all[2].name).toContain('cuota');
    expect(all[3].name).toContain('cuota');
  });
});
