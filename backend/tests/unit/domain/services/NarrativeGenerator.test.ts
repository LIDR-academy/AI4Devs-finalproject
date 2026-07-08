import { describe, it, expect } from 'vitest';
import { NarrativeGenerator } from '../../../../src/domain/services/NarrativeGenerator';

const baseAmort = {
  name: 'baseline' as const,
  monthlyPayment: 720,
  totalPaid: 259200,
  totalInterest: 99200,
  yearsToPayoff: 30,
  monthlyExtra: 0,
};
const lightAmort = { ...baseAmort, name: 'light' as const, yearsToPayoff: 25, totalInterest: 73000, monthlyExtra: 100 };

describe('NarrativeGenerator', () => {
  const gen = new NarrativeGenerator();

  it('renders conservador|baseline template', () => {
    const out = gen.generate({ persona: 'conservador', scenario: baseAmort });
    expect(out).toContain('720€');
    expect(out).toContain('99200€');
    expect(out).toContain('no es consejo financiero');
    expect(out).not.toContain('{cuota}');
    expect(out).not.toContain('{años}');
    expect(out).not.toContain('{intereses}');
  });

  it('renders conservador|light template with savings', () => {
    const out = gen.generate({
      persona: 'conservador',
      scenario: lightAmort,
      context: { baseAmortization: baseAmort, lightAmortization: lightAmort },
    });
    expect(out).toContain('26200');
    expect(out).toContain('25 años');
    expect(out).not.toContain('{años_light}');
  });

  it('falls back to equilibrado|any when combo missing', () => {
    const out = gen.generate({ persona: 'arriesgado', scenario: baseAmort });
    expect(out).toContain('equilibrio');
  });

  it('renders investment narrative with nominal and real values', () => {
    const invest = {
      name: 'moderate' as const,
      annualReturn: 0.06,
      nominalValue: 245000,
      realValue: 137000,
      totalContributed: 108000,
    };
    const out = gen.generate({
      persona: 'arriesgado',
      scenario: invest,
      context: { interestRate: 0.035, investModerate: invest },
    });
    expect(out).toContain('245000');
    expect(out).toContain('137000');
    expect(out).toContain('19-26%');
    expect(out).not.toContain('{valor_nominal}');
    expect(out).not.toContain('{valor_real}');
  });
});
