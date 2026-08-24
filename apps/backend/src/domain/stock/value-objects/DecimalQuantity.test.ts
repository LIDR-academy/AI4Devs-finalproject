import { describe, it, expect } from 'vitest';
import { DecimalQuantity } from './DecimalQuantity.js';

describe('TK-005: DecimalQuantity Domain Value Object Suite', () => {
  it('debe instanciar y formatear cantidades a 3 decimales de precisión (3.000)', () => {
    // 1. ARRANGE & ACT
    const qty = new DecimalQuantity('12.5');

    // 2. ASSERT
    // ORACULO ESTADO: Formato de 3 decimales exactos
    expect(qty.toString()).toBe('12.500');
    expect(qty.toNumber()).toBe(12.5);
  });

  it('debe sumar dos cantidades conservando la precisión decimal sin desbordamiento de punto flotante', () => {
    // 1. ARRANGE
    const a = new DecimalQuantity('0.1');
    const b = new DecimalQuantity('0.2');

    // 2. ACT
    const sum = a.add(b);

    // 3. ASSERT
    // ORACULO ESTADO: Evita el error clásico de IEEE 754 (0.1 + 0.2 = 0.300)
    expect(sum.toString()).toBe('0.300');
  });

  it('debe restar cantidades correctamente y lanzar un error si el sustraendo supera la cantidad disponible', () => {
    // 1. ARRANGE
    const disponible = new DecimalQuantity('1.000');
    const requerido = new DecimalQuantity('0.300');

    // 2. ACT
    const restante = disponible.subtract(requerido);

    // 3. ASSERT
    // ORACULO ESTADO: Saldo exacto
    expect(restante.toString()).toBe('0.700');

    // ARRANGE & ACT: Intento de restar mayor cantidad
    const exceso = new DecimalQuantity('2.000');
    expect(() => disponible.subtract(exceso)).toThrow(/supera la disponible/i);
  });

  it('debe rechazar cantidades negativas lanzando un error explicito', () => {
    // ARRANGE, ACT & ASSERT
    expect(() => new DecimalQuantity('-1.500')).toThrow(/no puede ser negativa/i);
  });
});
