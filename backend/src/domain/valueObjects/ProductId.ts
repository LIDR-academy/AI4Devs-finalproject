import { v4 as uuidv4 } from 'uuid';

export class ProductId {
  private readonly value: string;

  constructor(value: string) {
    this.validateId(value);
    this.value = value.toLowerCase();
  }

  private validateId(value: string): void {
    if (!value || value.trim() === '') {
      throw new Error('ProductId cannot be empty');
    }

    if (!ProductId.isValid(value)) {
      throw new Error('Invalid UUID format');
    }
  }

  getValue(): string {
    return this.value;
  }

  static generate(): ProductId {
    return new ProductId(uuidv4());
  }

  static isValid(value: string): boolean {
    if (!value) return false;
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  static fromString(value: string): ProductId {
    const trimmed = value.trim();
    return new ProductId(trimmed);
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 