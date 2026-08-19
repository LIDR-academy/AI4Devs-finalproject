import { describe, it, expect } from 'vitest';
import { DecimalQuantity } from './DecimalQuantity.js';

describe('DecimalQuantity — Value Object compartido para cantidades físicas', () => {
  it('crea una instancia desde un string decimal y lo formatea a 3 decimales', () => {
    const q = new DecimalQuantity('1.75');
    expect(q.toFixed(3)).toBe('1.750');
  });

  it('subtractClamped resta y nunca queda por debajo de cero (mismo comportamiento que kitchen.service.ts tenía inline)', () => {
    const q = new DecimalQuantity('1.750');
    const result = q.subtractClamped('0.250');
    expect(result.toFixed(3)).toBe('1.500');
  });

  it('subtractClamped clampea a "0.000" si la resta sería negativa, en vez de lanzar', () => {
    const q = new DecimalQuantity('1.000');
    const result = q.subtractClamped('5.000');
    expect(result.toFixed(3)).toBe('0.000');
  });

  it('isZero identifica correctamente la cantidad cero', () => {
    expect(new DecimalQuantity('0').isZero()).toBe(true);
    expect(new DecimalQuantity('0.001').isZero()).toBe(false);
  });

  it('acepta multiplicar por un factor (ej. porciones de receta) antes de restar', () => {
    const q = new DecimalQuantity('1.000');
    const portionCost = new DecimalQuantity('0.150').times(2);
    expect(q.subtractClamped(portionCost.toFixed(3)).toFixed(3)).toBe('0.700');
  });
});
