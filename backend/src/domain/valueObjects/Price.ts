export class Price {
  private readonly value: number;

  constructor(value: number) {
    this.validatePrice(value);
    this.value = Math.round(value * 100) / 100; // Round to 2 decimal places
  }

  private validatePrice(value: number): void {
    if (value == null || isNaN(value) || !isFinite(value)) {
      throw new Error('Price must be a valid number');
    }

    if (value < 0) {
      throw new Error('Price cannot be negative');
    }

    // Check decimal places
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new Error('Price cannot have more than 2 decimal places');
    }
  }

  getValue(): number {
    return this.value;
  }

  static fromString(priceString: string): Price {
    const trimmed = priceString.trim();
    const parsed = parseFloat(trimmed);
    
    if (isNaN(parsed) || trimmed === '') {
      throw new Error('Invalid price format');
    }

    return new Price(parsed);
  }

  toEuro(): string {
    return `€${this.value.toFixed(2)}`;
  }

  toString(): string {
    return this.value.toFixed(2);
  }

  equals(other: Price): boolean {
    return this.value === other.value;
  }

  isGreaterThan(other: Price): boolean {
    return this.value > other.value;
  }

  isLessThan(other: Price): boolean {
    return this.value < other.value;
  }

  add(other: Price): Price {
    return new Price(this.value + other.value);
  }

  subtract(other: Price): Price {
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error('Price cannot be negative');
    }
    return new Price(result);
  }

  multiply(multiplier: number): Price {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Price(this.value * multiplier);
  }

  applyDiscount(percentage: number): Price {
    if (percentage < 0) {
      throw new Error('Discount percentage cannot be negative');
    }
    if (percentage > 100) {
      throw new Error('Discount percentage cannot exceed 100%');
    }
    
    const discountAmount = (this.value * percentage) / 100;
    return new Price(this.value - discountAmount);
  }
} 