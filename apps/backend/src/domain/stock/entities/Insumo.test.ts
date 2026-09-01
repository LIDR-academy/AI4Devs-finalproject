import { describe, it, expect } from 'vitest';
import { Insumo } from './Insumo.js';
import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';

function buildInsumo(warehouseStock: string): Insumo {
  return new Insumo({
    id: 'ins-1',
    name: 'Tomate',
    unitOfMeasure: 'KG',
    warehouseStock: new DecimalQuantity(warehouseStock),
  });
}

describe('Insumo Domain Entity — Stock de Bodega', () => {
  it('hasSufficientStock debe devolver true cuando el stock alcanza exactamente lo solicitado', () => {
    const insumo = buildInsumo('10.000');
    expect(insumo.hasSufficientStock(new DecimalQuantity('10.000'))).toBe(true);
  });

  it('hasSufficientStock debe devolver false cuando lo solicitado supera el stock disponible', () => {
    const insumo = buildInsumo('5.000');
    expect(insumo.hasSufficientStock(new DecimalQuantity('5.001'))).toBe(false);
  });

  it('deductStock debe reducir el stock de bodega con precision decimal exacta', () => {
    const insumo = buildInsumo('10.000');
    insumo.deductStock(new DecimalQuantity('3.250'));
    expect(insumo.warehouseStock.toString()).toBe('6.750');
  });

  it('increaseStock debe incrementar el stock de bodega (ej. tras un restock)', () => {
    const insumo = buildInsumo('10.000');
    insumo.increaseStock(new DecimalQuantity('5.500'));
    expect(insumo.warehouseStock.toString()).toBe('15.500');
  });
});
