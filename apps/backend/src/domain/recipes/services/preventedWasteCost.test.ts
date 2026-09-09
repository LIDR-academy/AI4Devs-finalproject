import { describe, it, expect } from 'vitest';
import { computePreventedWasteCost } from './preventedWasteCost.js';
import { RescueIngredientItem } from '../entities/RescueRecipeProposal.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

function ing(insumoId: string, qty: string, isAtRisk: boolean): RescueIngredientItem {
  return { insumoId, insumoName: insumoId, quantity: new DecimalQuantity(qty), unit: 'KG', isAtRisk };
}

describe('TK-128: computePreventedWasteCost (US-035 Esc. 5-6, F-1)', () => {
  it('suma unitCost × quantity solo de los ingredientes en riesgo', () => {
    const cost = computePreventedWasteCost(
      [ing('ins-1', '2.000', true), ing('ins-2', '1.000', true), ing('ins-3', '5.000', false)],
      new Map([
        ['ins-1', new DecimalQuantity('3.00')],
        ['ins-2', new DecimalQuantity('1.50')],
        ['ins-3', new DecimalQuantity('9.99')],
      ])
    );
    // 2 × 3.00 + 1 × 1.50 = 7.50 ; ins-3 no cuenta (no está en riesgo)
    expect(cost?.toDecimal().toFixed(2)).toBe('7.50');
  });

  it('devuelve null si algún ingrediente en riesgo no tiene unitCost', () => {
    const cost = computePreventedWasteCost(
      [ing('ins-1', '2.000', true), ing('ins-2', '1.000', true)],
      new Map([['ins-1', new DecimalQuantity('3.00')]])
    );
    expect(cost).toBeNull();
  });

  it('devuelve null si no hay ningún ingrediente en riesgo', () => {
    const cost = computePreventedWasteCost(
      [ing('ins-1', '2.000', false)],
      new Map([['ins-1', new DecimalQuantity('3.00')]])
    );
    expect(cost).toBeNull();
  });

  it('no usa aritmética flotante — 0.1 × 0.2 da 0.02 exacto', () => {
    const cost = computePreventedWasteCost(
      [ing('ins-1', '0.1000', true)],
      new Map([['ins-1', new DecimalQuantity('0.20')]])
    );
    expect(cost?.toDecimal().toString()).toBe('0.02');
  });
});
