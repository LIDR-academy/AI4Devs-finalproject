import { describe, it, expect } from 'vitest';
import { WasteSummary } from './WasteSummary.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

function buildSummary(unitCost?: DecimalQuantity): WasteSummary {
  return new WasteSummary({
    insumoId: 'ins-queso-1',
    insumoName: 'Queso Mozzarella',
    unitOfMeasure: 'KG',
    totalDiscardedQuantity: new DecimalQuantity('3.500'),
    reason: 'EXPIRATION',
    unitCost,
  });
}

describe('WasteSummary Domain Entity — Consolidado de Mermas', () => {
  it('expone insumoId, insumoName, unitOfMeasure, totalDiscardedQuantity y reason tal como fueron construidos', () => {
    const summary = buildSummary();

    expect(summary.insumoId).toBe('ins-queso-1');
    expect(summary.insumoName).toBe('Queso Mozzarella');
    expect(summary.unitOfMeasure).toBe('KG');
    expect(summary.totalDiscardedQuantity.toString()).toBe('3.500');
    expect(summary.reason).toBe('EXPIRATION');
  });

  it('unitCost debe ser undefined cuando el insumo no tiene costo registrado (US-019)', () => {
    const summary = buildSummary();
    expect(summary.unitCost).toBeUndefined();
  });

  it('unitCost debe exponer el costo por unidad de compra cuando fue registrado (US-019)', () => {
    const summary = buildSummary(new DecimalQuantity('1800.00'));
    expect(summary.unitCost?.toDecimal().toFixed(2)).toBe('1800.00');
  });
});
