/**
 * InvestmentCalculator (T055, FR-021).
 * 3 scenarios: 4%, 6%, 8% annual. With "valor real" adjusted by 2% inflation.
 */
import type { InvestmentInput, InvestmentScenario } from '../ports/MortgageCalculatorPort';

const MONTHS_PER_YEAR = 12;

export class InvestmentCalculator {
  invest(input: InvestmentInput): InvestmentScenario {
    const monthlyRate = input.annualReturn / MONTHS_PER_YEAR;
    const months = input.years * MONTHS_PER_YEAR;

    const nominal = this.futureValue(input.monthlyContribution, monthlyRate, months);
    const real = this.realValue(nominal, input.inflation, input.years);
    const contributed = input.monthlyContribution * months;

    return {
      name: this.scenarioName(input.annualReturn),
      annualReturn: input.annualReturn,
      nominalValue: nominal,
      realValue: real,
      totalContributed: contributed,
    };
  }

  generateAllScenarios(input: Omit<InvestmentInput, 'annualReturn'>): InvestmentScenario[] {
    return [0.04, 0.06, 0.08].map((r) => this.invest({ ...input, annualReturn: r }));
  }

  private futureValue(monthly: number, monthlyRate: number, months: number): number {
    if (monthlyRate === 0) return monthly * months;
    return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  }

  private realValue(nominal: number, inflation: number, years: number): number {
    return nominal / Math.pow(1 + inflation, years);
  }

  private scenarioName(r: number): InvestmentScenario['name'] {
    if (r <= 0.05) return 'conservative';
    if (r <= 0.07) return 'moderate';
    return 'aggressive';
  }
}
