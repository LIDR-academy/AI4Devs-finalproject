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

  it('unitCost debe ser undefined cuando el insumo no tiene costo registrado (US-019)', () => {
    const insumo = buildInsumo('10.000');
    expect(insumo.unitCost).toBeUndefined();
  });

  it('unitCost debe exponer el costo por unidad de compra cuando fue registrado (US-019)', () => {
    const insumo = new Insumo({
      id: 'ins-1',
      name: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      warehouseStock: new DecimalQuantity('10.000'),
      unitCost: new DecimalQuantity('1800.00'),
    });
    expect(insumo.unitCost?.toDecimal().toFixed(2)).toBe('1800.00');
  });
});

describe('Insumo Domain Entity — Stock Multi-Sub-Sector (US-025)', () => {
  const multiSector = (): Insumo =>
    new Insumo({
      id: 'ins-lomo',
      name: 'Lomo Vacuno',
      unitOfMeasure: 'KG',
      stockLines: [
        { storageLocationId: 'sec-carnes', quantity: new DecimalQuantity('12.000') },
        { storageLocationId: 'sec-congelados', quantity: new DecimalQuantity('8.000') },
      ],
    });

  it('warehouseStock es la suma de todas las líneas de sub-sector', () => {
    expect(multiSector().warehouseStock.toString()).toBe('20.000');
  });

  it('stockAt devuelve el saldo de un sub-sector concreto (0 si no hay línea)', () => {
    const insumo = multiSector();
    expect(insumo.stockAt('sec-carnes').toString()).toBe('12.000');
    expect(insumo.stockAt('sec-inexistente').toString()).toBe('0.000');
  });

  it('hasSufficientStockAt valida contra el saldo del sub-sector, no el total', () => {
    const insumo = multiSector();
    expect(insumo.hasSufficientStockAt(new DecimalQuantity('15.000'), 'sec-carnes')).toBe(false);
    expect(insumo.hasSufficientStockAt(new DecimalQuantity('12.000'), 'sec-carnes')).toBe(true);
  });

  it('deductStockAt debita solo del sub-sector indicado', () => {
    const insumo = multiSector();
    insumo.deductStockAt(new DecimalQuantity('5.000'), 'sec-carnes');
    expect(insumo.stockAt('sec-carnes').toString()).toBe('7.000');
    expect(insumo.stockAt('sec-congelados').toString()).toBe('8.000');
  });

  it('deductStockAt rechaza con InsufficientStockException si el sub-sector no alcanza, sin tocar otras líneas', () => {
    const insumo = multiSector();
    expect(() => insumo.deductStockAt(new DecimalQuantity('15.000'), 'sec-congelados')).toThrow(
      /Stock insuficiente/
    );
    expect(insumo.stockAt('sec-carnes').toString()).toBe('12.000');
    expect(insumo.stockAt('sec-congelados').toString()).toBe('8.000');
  });

  it('restockAt crea la línea del sub-sector si aún no existía', () => {
    const insumo = multiSector();
    insumo.restockAt(new DecimalQuantity('3.000'), 'sec-secos');
    expect(insumo.stockAt('sec-secos').toString()).toBe('3.000');
    expect(insumo.warehouseStock.toString()).toBe('23.000');
  });
});

describe('TK-130: Insumo.withDetails (US-036)', () => {
  const base = () =>
    new Insumo({
      id: 'ins-1',
      name: 'Harina 00',
      unitOfMeasure: 'KG',
      unitCost: new DecimalQuantity('800.00'),
      barcode: '779000',
      stockLines: [{ storageLocationId: 'loc-a', quantity: new DecimalQuantity('9.000') }],
    });

  it('edita solo los campos del patch y preserva id, unitOfMeasure y stockLines', () => {
    const next = base().withDetails({ name: 'Harina 000', unitCost: new DecimalQuantity('820.00') });
    expect(next.id).toBe('ins-1');
    expect(next.name).toBe('Harina 000');
    expect(next.unitOfMeasure).toBe('KG');
    expect(next.unitCost?.toDecimal().toFixed(2)).toBe('820.00');
    expect(next.barcode).toBe('779000');
    expect(next.stockLines[0]).toMatchObject({ storageLocationId: 'loc-a' });
    expect(next.warehouseStock.toString()).toBe('9.000');
  });

  it('undefined conserva el valor actual; null limpia unitCost y barcode', () => {
    const kept = base().withDetails({});
    expect(kept.unitCost?.toDecimal().toFixed(2)).toBe('800.00');
    expect(kept.barcode).toBe('779000');

    const cleared = base().withDetails({ unitCost: null, barcode: null });
    expect(cleared.unitCost).toBeUndefined();
    expect(cleared.barcode).toBeUndefined();
  });
});
