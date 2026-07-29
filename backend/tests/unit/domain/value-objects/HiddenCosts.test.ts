import { describe, it, expect } from 'vitest';
import { HiddenCosts } from '../../../../src/domain/value-objects/HiddenCosts';

describe('HiddenCosts', () => {
  it('computes Madrid ITP at 6%', () => {
    const costs = HiddenCosts.calculate(200_000, 'Madrid', false);
    // ITP: 200000 * 0.06 = 12000
    expect(costs.itpOrIva).toBe(12_000);
  });

  it('computes Cataluña ITP at 10%', () => {
    const costs = HiddenCosts.calculate(200_000, 'Cataluña', false);
    expect(costs.itpOrIva).toBe(20_000);
  });

  it('applies 10% IVA for new housing', () => {
    const costs = HiddenCosts.calculate(200_000, 'Madrid', true);
    expect(costs.itpOrIva).toBe(20_000);
  });

  it('includes fixed gestoría and tasación', () => {
    const costs = HiddenCosts.calculate(200_000, 'Madrid', false);
    expect(costs.gestoria).toBe(350);
    expect(costs.tasacion).toBe(350);
  });

  it('caps notaría and registro', () => {
    const costs = HiddenCosts.calculate(2_000_000, 'Madrid', false);
    expect(costs.notaria).toBe(1500);
    expect(costs.registro).toBe(1000);
  });

  it('rejects non-positive prices', () => {
    expect(() => HiddenCosts.calculate(0, 'Madrid', false)).toThrow();
    expect(() => HiddenCosts.calculate(-100, 'Madrid', false)).toThrow();
  });
});
