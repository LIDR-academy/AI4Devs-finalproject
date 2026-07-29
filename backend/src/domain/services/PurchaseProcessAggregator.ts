/**
 * PurchaseProcessAggregator (T058a).
 * Pure domain: takes propertyPrice + financialProfile, returns ComputedMortgage
 * with hidden costs, 4 amortization scenarios, 3 investment scenarios.
 * Returns null if no propertyPrice (the UI will show "introduce precio").
 */
import { HiddenCostsCalculator } from './HiddenCostsCalculator';
import { AmortizationCalculator } from './AmortizationCalculator';
import { InvestmentCalculator } from './InvestmentCalculator';
import type { FinancialProfile, Region } from '../value-objects/FinancialProfile';
import type { AmortizationScenario, InvestmentScenario } from '../ports/MortgageCalculatorPort';
import type { HiddenCosts } from '../value-objects/HiddenCosts';

export interface ComputedMortgage {
  hiddenCosts: HiddenCosts;
  totalCash: number;
  gap: number;
  loanAmount: number;
  monthlyPayment30yr: number;
  amortizationScenarios: AmortizationScenario[];
  investmentScenarios: InvestmentScenario[];
}

const DEFAULT_INTEREST_RATE = 0.035;
const DEFAULT_TERM_YEARS = 30;
const INFLATION = 0.02;
const INVESTMENT_MONTHLY_CONTRIBUTION = 300;

export class PurchaseProcessAggregator {
  private readonly hidden = new HiddenCostsCalculator();
  private readonly amort = new AmortizationCalculator();
  private readonly invest = new InvestmentCalculator();

  compute(
    propertyPrice: number | null,
    financialProfile: FinancialProfile | null,
  ): ComputedMortgage | null {
    if (propertyPrice === null || propertyPrice <= 0) return null;

    const savings = financialProfile?.savings ?? 0;
    const region = (financialProfile?.region ?? 'Madrid') as Region;
    const interestRate = financialProfile?.interestRate ?? DEFAULT_INTEREST_RATE;
    const loanAmount = Math.round(Math.max(0, propertyPrice - savings));

    const hiddenCosts = this.hidden.calculate(propertyPrice, region, false, {
      isFirstHome: financialProfile?.isFirstHome ?? false,
      buyerAge: financialProfile?.buyerAge ?? undefined,
      isProtectedHousing: financialProfile?.isProtectedHousing ?? false,
    });

    const totalCash = propertyPrice + hiddenCosts.total;
    const gap = savings - totalCash;

    const amortizationScenarios = this.amort.generateAllScenarios({
      principal: loanAmount > 0 ? loanAmount : propertyPrice,
      annualRate: interestRate,
      years: DEFAULT_TERM_YEARS,
    });

    const investmentScenarios = this.invest.generateAllScenarios({
      monthlyContribution: INVESTMENT_MONTHLY_CONTRIBUTION,
      years: DEFAULT_TERM_YEARS,
      inflation: INFLATION,
    });

    return {
      hiddenCosts,
      totalCash,
      gap,
      loanAmount,
      monthlyPayment30yr: amortizationScenarios[0].monthlyPayment,
      amortizationScenarios,
      investmentScenarios,
    };
  }
}
