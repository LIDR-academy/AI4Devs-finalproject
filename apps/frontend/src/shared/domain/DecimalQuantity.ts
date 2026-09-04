import Decimal from 'decimal.js';

/**
 * Value Object compartido para cantidades físicas con precisión decimal.
 * Antes, kitchen.service.ts reimplementaba `new Decimal(...)` + `Decimal.max(0, ...)`
 * inline en dos métodos distintos — este VO centraliza esa lógica.
 *
 * Nota de comportamiento (deliberadamente preservada, no decidida por mí):
 * `subtractClamped` clampea a cero en vez de lanzar cuando el resultado sería
 * negativo — igual que el código original. El backend (`DecimalQuantity.ts`
 * del dominio) SÍ lanza una excepción ante un resultado negativo. Esta
 * divergencia solo afecta el modo mock/offline del frontend (nunca la ruta
 * real contra el backend, que ya aplica su propia validación) — es una
 * decisión de producto pendiente, no algo que este refactor de modularización
 * deba resolver unilateralmente.
 */
export class DecimalQuantity {
  private readonly value: Decimal;

  constructor(value: string | number | Decimal) {
    this.value = new Decimal(value);
  }

  public add(amount: string | number | Decimal): DecimalQuantity {
    return new DecimalQuantity(this.value.plus(new Decimal(amount)));
  }

  public subtractClamped(amount: string | number | Decimal): DecimalQuantity {
    const result = Decimal.max(0, this.value.minus(new Decimal(amount)));
    return new DecimalQuantity(result);
  }

  /** Devuelve `this` si es >= `min`, si no devuelve `min` (clamp inferior). */
  public clampMin(min: string | number | Decimal): DecimalQuantity {
    return new DecimalQuantity(Decimal.max(new Decimal(min), this.value));
  }

  public toNumber(): number {
    return this.value.toNumber();
  }

  public isPositive(): boolean {
    return this.value.isPositive() && !this.value.isZero();
  }

  public times(factor: string | number | Decimal): DecimalQuantity {
    return new DecimalQuantity(this.value.times(new Decimal(factor)));
  }

  public isZero(): boolean {
    return this.value.isZero();
  }

  /** US-028: cuadre de conciliación (sobrante + merma vs. lo extraído) — sin flotantes. */
  public isGreaterThan(amount: string | number | Decimal): boolean {
    return this.value.greaterThan(new Decimal(amount));
  }

  public toFixed(decimals: number): string {
    return this.value.toFixed(decimals);
  }
}
