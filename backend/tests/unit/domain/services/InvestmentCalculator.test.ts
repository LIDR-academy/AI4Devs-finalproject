import { describe, it, expect } from 'vitest';
import { InvestmentCalculator } from '../../../../src/domain/services/InvestmentCalculator';

describe('InvestmentCalculator', () => {
  const calc = new InvestmentCalculator();

  it('computes investment at 6% over 30 years', () => {
    const scenario = calc.invest({
      monthlyContribution: 300,
      annualReturn: 0.06,
      years: 30,
      inflation: 0.02,
    });
    expect(scenario.name).toBe('moderado (6%)');
    expect(scenario.nominalValue).toBeGreaterThan(scenario.totalContributed);
    expect(scenario.realValue).toBeLessThan(scenario.nominalValue);
  });

  it('real value is lower than nominal at positive inflation', () => {
    const scenario = calc.invest({
      monthlyContribution: 100,
      annualReturn: 0.04,
      years: 10,
      inflation: 0.02,
    });
    expect(scenario.realValue).toBeLessThan(scenario.nominalValue);
  });

  it('generates 3 scenarios', () => {
    const all = calc.generateAllScenarios({ monthlyContribution: 300, years: 30, inflation: 0.02 });
    expect(all).toHaveLength(3);
    expect(all.map((s) => s.name)).toEqual(['conservador (4%)', 'moderado (6%)', 'agresivo (8%)']);
  });
});
