import { describe, it, expect } from 'vitest';
import Decimal from 'decimal.js';
import { Temperature } from './Temperature.js';

describe('US-033 / TK-137: Temperature Domain Value Object Suite', () => {
  it('debe instanciar y formatear a exactamente 2 decimales (no 3, que es el formato de cantidades físicas)', () => {
    // ORACULO ESTADO: formato de 2 decimales exactos
    expect(new Temperature('4').toString()).toBe('4.00');
    expect(new Temperature('4.5').toString()).toBe('4.50');
    expect(new Temperature(4.567).toString()).toBe('4.57');
  });

  it('debe aceptar lecturas negativas legítimas de congelador (-18.00°C) — a diferencia de DecimalQuantity', () => {
    // ORACULO ESTADO: el rango negativo es válido para temperaturas (regla de diseño del VO)
    const freezer = new Temperature('-18');
    expect(freezer.toString()).toBe('-18.00');
    expect(freezer.toNumber()).toBe(-18);
  });

  it('debe preservar la precisión arbitraria y exponer el Decimal subyacente sin pérdida', () => {
    const t = new Temperature('0.1');
    // ORACULO ESTADO: toDecimal() devuelve el Decimal real, no un round-trip por float
    expect(t.toDecimal()).toBeInstanceOf(Decimal);
    expect(t.toDecimal().equals(new Decimal('0.1'))).toBe(true);
    expect(t.toNumber()).toBe(0.1);
  });

  it('debe aceptar un Decimal ya construido como entrada', () => {
    expect(new Temperature(new Decimal('-0.5')).toString()).toBe('-0.50');
  });

  it('isLessThanOrEqualTo: compara contra otra Temperature en ambos sentidos, incluyendo la igualdad', () => {
    const cold = new Temperature('2.00');
    const warm = new Temperature('8.00');
    // ORACULO ESTADO: orden estricto
    expect(cold.isLessThanOrEqualTo(warm)).toBe(true);
    expect(warm.isLessThanOrEqualTo(cold)).toBe(false);
    // ORACULO ESTADO: el límite (==) también satisface <=
    expect(cold.isLessThanOrEqualTo(new Temperature('2.00'))).toBe(true);
  });

  it('debe rechazar valores no finitos (Infinity, -Infinity, NaN) con un error explícito', () => {
    expect(() => new Temperature(Infinity)).toThrow(/finito/i);
    expect(() => new Temperature(-Infinity)).toThrow(/finito/i);
    expect(() => new Temperature(NaN)).toThrow(/finito/i);
    expect(() => new Temperature('no-es-un-numero')).toThrow();
  });
});
