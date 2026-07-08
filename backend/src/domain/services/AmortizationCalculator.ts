/**
 * AmortizationCalculator (T054).
 * 30-year mortgage with 4 voluntary-amortization scenarios: baseline, 100, 300, 500 €/mo.
 */
import type { AmortizationInput, AmortizationScenario } from '../ports/MortgageCalculatorPort';

const MONTHS_PER_YEAR = 12;

export class AmortizationCalculator {
  readonly scenarios: AmortizationScenario[] = [];

  amortize(input: AmortizationInput): AmortizationScenario {
    const monthlyRate = input.annualRate / MONTHS_PER_YEAR;
    const totalMonths = input.years * MONTHS_PER_YEAR;
    const basePayment = this.monthlyPayment(input.principal, monthlyRate, totalMonths);
    const totalPayment = (basePayment + input.monthlyExtra) * totalMonths;
    const yearsToPayoff = this.yearsToPayoff(
      input.principal,
      basePayment + input.monthlyExtra,
      monthlyRate,
    );
    const totalInterest = totalPayment - input.principal;

    const name = this.scenarioName(input.monthlyExtra);
    return {
      name,
      monthlyPayment: basePayment,
      totalPaid: totalPayment,
      totalInterest,
      yearsToPayoff,
      monthlyExtra: input.monthlyExtra,
    };
  }

  generateAllScenarios(input: Omit<AmortizationInput, 'monthlyExtra'>): AmortizationScenario[] {
    return [0, 100, 300, 500].map((extra) => this.amortize({ ...input, monthlyExtra: extra }));
  }

  private monthlyPayment(principal: number, monthlyRate: number, months: number): number {
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  private yearsToPayoff(principal: number, payment: number, monthlyRate: number): number {
    if (payment <= principal * monthlyRate) return Infinity;
    const months = -Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    return months / MONTHS_PER_YEAR;
  }

  private scenarioName(extra: number): AmortizationScenario['name'] {
    if (extra === 0) return 'baseline';
    if (extra <= 150) return 'light';
    if (extra <= 400) return 'moderate';
    return 'aggressive';
  }
}
