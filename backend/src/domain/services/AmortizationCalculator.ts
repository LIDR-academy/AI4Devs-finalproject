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
    const yearsReduced = input.years - yearsToPayoff;

    const name = this.formatName(input.monthlyExtra, basePayment);
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

  private formatName(extra: number, basePayment: number): string {
    if (extra === 0) return 'Sin amortizar';
    const cuotas = Math.round((extra * MONTHS_PER_YEAR) / basePayment);
    if (cuotas <= 0) return `+${extra}€/mes`;
    return `${cuotas} cuota${cuotas > 1 ? 's' : ''} extra/año (+${extra}€/mes)`;
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
}
