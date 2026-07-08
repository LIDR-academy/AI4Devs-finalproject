/**
 * NarrativeGenerator — Mortgage Compass narrative templates (FR-013).
 * Selects template by (persona, scenario) and substitutes variables.
 * No LLM is used.
 */
import type { Persona } from '../value-objects/FinancialProfile';
import type { AmortizationScenario } from '../ports/MortgageCalculatorPort';
import type { InvestmentScenario } from '../ports/MortgageCalculatorPort';

const DISCLAIMER =
  'Disclaimer: esto no es consejo financiero. Son cálculos sobre tu perfil declarado.';

const TEMPLATES: Record<string, string> = {
  'conservador|baseline': `Tu hipoteca a 30 años al 3,5% tiene una cuota mensual de {cuota}€ durante {años} años,
pagando un total de {intereses}€ en intereses. No amortizas voluntariamente.

Esta es la opción "no hacer nada" — la más cómoda a corto plazo pero la más cara a largo plazo.

${DISCLAIMER}`,

  'conservador|light': `Con la opción ligera (+{extra}€/mes de amortización voluntaria), reduces la vida del
préstamo de {años_base} a {años_light} años. Total ahorrado en intereses: {ahorro_light}€.

Has elegido la opción más conservadora: priorizar la seguridad de tu vivienda.

${DISCLAIMER}`,

  'conservador|moderate': `Con la opción moderada (+{extra}€/mes), reduces la vida del préstamo a
{años_moderate} años y ahorras {ahorro_moderate}€ en intereses.

Equilibrio entre seguridad y liquidez. Sigues teniendo efectivo disponible para imprevistos.

${DISCLAIMER}`,

  'conservador|aggressive': `Con la opción agresiva (+{extra}€/mes), reduces la vida del préstamo a
{años_aggressive} años. Total ahorrado en intereses: {ahorro_aggressive}€.

La más ambiciosa para un perfil conservador. Acumulas patrimonio más rápido, pero reduces liquidez.

${DISCLAIMER}`,

  'arriesgado|invest-moderate': `Si en lugar de amortizar {extra}€/mes, inviertes esa cantidad en un fondo
diversificado con rentabilidad media histórica del {rentabilidad}% anual,
acumularías {valor_nominal}€ en {años} años (cifra nominal).

Ajustado por inflación ({inflacion}% anual), el valor real sería {valor_real}€.

Compara con la opción de amortización: la rentabilidad de la hipoteca es garantizada al
{tipo_hipoteca}%, mientras que la inversión tiene riesgo y está sujeta a tributación
(~19-26% en España para ganancias patrimoniales).

Las rentabilidades pasadas no garantizan futuras.

${DISCLAIMER}`,

  'equilibrado|any': `Tu perfil indica preferencia por el equilibrio entre seguridad y oportunidad.
Te mostramos las opciones lado a lado: cada una tiene trade-offs que debes evaluar
según tu situación personal (estabilidad laboral, otros compromisos, horizonte temporal).

Recomendación educativa: antes de decidir, asegúrate de tener un fondo de emergencia
equivalente a 3-6 meses de gastos.

${DISCLAIMER}`,
};

export interface NarrativeInput {
  persona: Persona;
  scenario: AmortizationScenario | InvestmentScenario;
  context?: {
    baseAmortization?: AmortizationScenario;
    lightAmortization?: AmortizationScenario;
    moderateAmortization?: AmortizationScenario;
    aggressiveAmortization?: AmortizationScenario;
    investModerate?: InvestmentScenario;
    interestRate?: number;
  };
}

export class NarrativeGenerator {
  generate(input: NarrativeInput): string {
    const isInvestment = 'nominalValue' in input.scenario;
    const prefix = isInvestment ? 'invest-' : '';
    const key = `${input.persona}|${prefix}${input.scenario.name}`;
    const template = TEMPLATES[key] ?? TEMPLATES['equilibrado|any'];

    const amort = isInvestment ? null : (input.scenario as AmortizationScenario);
    const invest = isInvestment ? (input.scenario as InvestmentScenario) : null;

    return this.substitute(template, {
      cuota: amort ? Math.round(amort.monthlyPayment) : 0,
      años: amort ? Math.round(amort.yearsToPayoff) : 30,
      intereses: amort ? Math.round(amort.totalInterest) : 0,
      extra: amort?.monthlyExtra ?? 0,
      valor_nominal: invest ? Math.round(invest.nominalValue) : 0,
      valor_real: invest ? Math.round(invest.realValue) : 0,
      rentabilidad: invest ? invest.annualReturn * 100 : 0,
      inflacion: 2,
      tipo_hipoteca: (input.context?.interestRate ?? 0.035) * 100,
      años_base: Math.round(input.context?.baseAmortization?.yearsToPayoff ?? 30),
      años_light: Math.round(input.context?.lightAmortization?.yearsToPayoff ?? 28),
      años_moderate: Math.round(input.context?.moderateAmortization?.yearsToPayoff ?? 25),
      años_aggressive: Math.round(input.context?.aggressiveAmortization?.yearsToPayoff ?? 22),
      ahorro_light: Math.round(
        (input.context?.baseAmortization?.totalInterest ?? 0) -
          (input.context?.lightAmortization?.totalInterest ?? 0),
      ),
      ahorro_moderate: Math.round(
        (input.context?.baseAmortization?.totalInterest ?? 0) -
          (input.context?.moderateAmortization?.totalInterest ?? 0),
      ),
      ahorro_aggressive: Math.round(
        (input.context?.baseAmortization?.totalInterest ?? 0) -
          (input.context?.aggressiveAmortization?.totalInterest ?? 0),
      ),
    });
  }

  private substitute(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, key: string) =>
      vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
    );
  }
}
