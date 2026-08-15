import Decimal from 'decimal.js';

export class DecimalQuantity {
  private readonly value: Decimal;

  constructor(value: number | string | Decimal) {
    const parsed = new Decimal(value);
    if (parsed.isNegative()) {
      throw new Error('La cantidad no puede ser negativa.');
    }
    this.value = parsed;
  }

  public add(other: DecimalQuantity): DecimalQuantity {
    return new DecimalQuantity(this.value.plus(other.value));
  }

  public subtract(other: DecimalQuantity): DecimalQuantity {
    if (this.value.lessThan(other.value)) {
      throw new Error('La cantidad a restar supera la disponible.');
    }
    return new DecimalQuantity(this.value.minus(other.value));
  }

  public isGreaterThanOrEqualTo(other: DecimalQuantity): boolean {
    return this.value.greaterThanOrEqualTo(other.value);
  }

  public toNumber(): number {
    return this.value.toNumber();
  }

  public toString(): string {
    return this.value.toFixed(3);
  }

  public toDecimal(): Decimal {
    return this.value;
  }
}
