import Decimal from 'decimal.js';

/**
 * US-033/TK-120: valor de temperatura en grados Celsius. NO reutiliza `DecimalQuantity`
 * (verificado en su código real) a propósito: esa clase rechaza valores negativos por
 * diseño (cantidades físicas de inventario nunca lo son), pero una lectura de congelador
 * legítimamente es negativa (ej. -18.00°C) — reusar esa clase habría roto ese caso real.
 * Reutiliza el mismo patrón de precisión arbitraria (`decimal.js`), sin esa restricción,
 * y formatea a 2 decimales (no 3, que es el formato de cantidades físicas).
 */
export class Temperature {
  private readonly value: Decimal;

  constructor(value: number | string | Decimal) {
    const parsed = new Decimal(value);
    if (!parsed.isFinite()) {
      throw new Error('La temperatura debe ser un valor numérico finito.');
    }
    this.value = parsed;
  }

  public isLessThanOrEqualTo(other: Temperature): boolean {
    return this.value.lessThanOrEqualTo(other.value);
  }

  public toNumber(): number {
    return this.value.toNumber();
  }

  public toString(): string {
    return this.value.toFixed(2);
  }

  public toDecimal(): Decimal {
    return this.value;
  }
}
