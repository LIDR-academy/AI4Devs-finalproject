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
    const actualPayment = basePayment + input.monthlyExtra;
    const monthsToPayoff = this.monthsToPayoff(input.principal, actualPayment, monthlyRate, totalMonths);
    const totalPaid = actualPayment * monthsToPayoff;
    const totalInterest = totalPaid - input.principal;
    const yearsToPayoff = monthsToPayoff / MONTHS_PER_YEAR;

    const name = this.scenarioName(input.monthlyExtra);
    const baselineYears = input.years;
    const yearsReduced = baselineYears - yearsToPayoff;
    return {
      name,
      monthlyPayment: basePayment,
      totalPaid,
      totalInterest,
      yearsToPayoff,
      yearsReduced,
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

  private monthsToPayoff(
    principal: number,
    payment: number,
    monthlyRate: number,
    cap: number,
  ): number {
    if (payment <= principal * monthlyRate) return cap;
    if (monthlyRate === 0) return Math.ceil(principal / payment);
    const months = -Math.log(1 - (principal * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    return Math.min(Math.ceil(months), cap);
  }

  private scenarioName(extra: number): AmortizationScenario['name'] {
    if (extra === 0) return 'sin amortizar';
    if (extra <= 150) return 'ligera (+100€/mes)';
    if (extra <= 400) return 'moderada (+300€/mes)';
    return 'agresiva (+500€/mes)';
  }
}
