/**
 * MortgageCalculatorPort.
 * Adapters: HiddenCostsCalculator, AmortizationCalculator, InvestmentCalculator.
 */
export interface AmortizationInput {
  principal: number;
  annualRate: number;
  years: number;
  monthlyExtra: number;
}

export interface AmortizationScenario {
  name: string;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  yearsToPayoff: number;
  yearsReduced: number;
  monthlyExtra: number;
}

export interface InvestmentInput {
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  inflation: number;
}

export interface InvestmentScenario {
  name: string;
  annualReturn: number;
  nominalValue: number;
  realValue: number;
  totalContributed: number;
}

export interface MortgageCalculatorPort {
  amortize(input: AmortizationInput): AmortizationScenario;
  invest(input: InvestmentInput): InvestmentScenario;
}
