import { Price } from '../../../../src/domain/valueObjects/Price';

describe('Price Value Object', () => {
  describe('constructor', () => {
    it('should create a valid price with positive number', () => {
      const price = new Price(19.99);
      expect(price.getValue()).toBe(19.99);
    });

    it('should create a valid price with zero', () => {
      const price = new Price(0);
      expect(price.getValue()).toBe(0);
    });

    it('should create a valid price with integer', () => {
      const price = new Price(25);
      expect(price.getValue()).toBe(25);
    });

    it('should throw error for negative price', () => {
      expect(() => new Price(-1)).toThrow('Price cannot be negative');
      expect(() => new Price(-0.01)).toThrow('Price cannot be negative');
      expect(() => new Price(-100)).toThrow('Price cannot be negative');
    });

    it('should throw error for NaN', () => {
      expect(() => new Price(NaN)).toThrow('Price must be a valid number');
    });

    it('should throw error for Infinity', () => {
      expect(() => new Price(Infinity)).toThrow('Price must be a valid number');
      expect(() => new Price(-Infinity)).toThrow('Price must be a valid number');
    });

    it('should handle very large numbers', () => {
      const largePrice = 999999.99;
      const price = new Price(largePrice);
      expect(price.getValue()).toBe(largePrice);
    });

    it('should validate decimal places', () => {
      // Should allow up to 2 decimal places
      expect(() => new Price(19.99)).not.toThrow();
      expect(() => new Price(19.9)).not.toThrow();
      expect(() => new Price(19)).not.toThrow();
      
      // Should throw for more than 2 decimal places
      expect(() => new Price(19.999)).toThrow('Price cannot have more than 2 decimal places');
      expect(() => new Price(19.9999)).toThrow('Price cannot have more than 2 decimal places');
    });
  });

  describe('fromString', () => {
    it('should create price from valid string', () => {
      const price = Price.fromString('19.99');
      expect(price.getValue()).toBe(19.99);
    });

    it('should create price from integer string', () => {
      const price = Price.fromString('25');
      expect(price.getValue()).toBe(25);
    });

    it('should create price from zero string', () => {
      const price = Price.fromString('0');
      expect(price.getValue()).toBe(0);
    });

    it('should throw error for invalid string', () => {
      expect(() => Price.fromString('invalid')).toThrow('Invalid price format');
      expect(() => Price.fromString('abc')).toThrow('Invalid price format');
      expect(() => Price.fromString('')).toThrow('Invalid price format');
    });

    it('should throw error for negative string', () => {
      expect(() => Price.fromString('-19.99')).toThrow('Price cannot be negative');
    });

    it('should handle string with currency symbols', () => {
      expect(() => Price.fromString('€19.99')).toThrow('Invalid price format');
      expect(() => Price.fromString('$19.99')).toThrow('Invalid price format');
    });

    it('should handle whitespace', () => {
      const price = Price.fromString(' 19.99 ');
      expect(price.getValue()).toBe(19.99);
    });
  });

  describe('toEuro', () => {
    it('should format price with Euro symbol', () => {
      const price = new Price(19.99);
      expect(price.toEuro()).toBe('€19.99');
    });

    it('should format integer price', () => {
      const price = new Price(25);
      expect(price.toEuro()).toBe('€25.00');
    });

    it('should format zero price', () => {
      const price = new Price(0);
      expect(price.toEuro()).toBe('€0.00');
    });

    it('should format single decimal place', () => {
      const price = new Price(19.9);
      expect(price.toEuro()).toBe('€19.90');
    });

    it('should format large numbers', () => {
      const price = new Price(1234.56);
      expect(price.toEuro()).toBe('€1234.56');
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const price = new Price(19.99);
      expect(price.toString()).toBe('19.99');
    });

    it('should format with 2 decimal places', () => {
      const price = new Price(25);
      expect(price.toString()).toBe('25.00');
    });

    it('should handle zero', () => {
      const price = new Price(0);
      expect(price.toString()).toBe('0.00');
    });
  });

  describe('equals', () => {
    it('should return true for equal prices', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(19.99);
      expect(price1.equals(price2)).toBe(true);
    });

    it('should return false for different prices', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(20.00);
      expect(price1.equals(price2)).toBe(false);
    });

    it('should handle zero comparison', () => {
      const price1 = new Price(0);
      const price2 = new Price(0);
      expect(price1.equals(price2)).toBe(true);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when price is greater', () => {
      const price1 = new Price(20.00);
      const price2 = new Price(19.99);
      expect(price1.isGreaterThan(price2)).toBe(true);
    });

    it('should return false when price is less', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(20.00);
      expect(price1.isGreaterThan(price2)).toBe(false);
    });

    it('should return false when prices are equal', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(19.99);
      expect(price1.isGreaterThan(price2)).toBe(false);
    });
  });

  describe('isLessThan', () => {
    it('should return true when price is less', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(20.00);
      expect(price1.isLessThan(price2)).toBe(true);
    });

    it('should return false when price is greater', () => {
      const price1 = new Price(20.00);
      const price2 = new Price(19.99);
      expect(price1.isLessThan(price2)).toBe(false);
    });

    it('should return false when prices are equal', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(19.99);
      expect(price1.isLessThan(price2)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add two prices correctly', () => {
      const price1 = new Price(10.50);
      const price2 = new Price(5.25);
      const result = price1.add(price2);
      expect(result.getValue()).toBe(15.75);
    });

    it('should handle adding zero', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(0);
      const result = price1.add(price2);
      expect(result.getValue()).toBe(19.99);
    });
  });

  describe('subtract', () => {
    it('should subtract two prices correctly', () => {
      const price1 = new Price(20.00);
      const price2 = new Price(5.25);
      const result = price1.subtract(price2);
      expect(result.getValue()).toBe(14.75);
    });

    it('should throw error when result would be negative', () => {
      const price1 = new Price(5.00);
      const price2 = new Price(10.00);
      expect(() => price1.subtract(price2)).toThrow('Price cannot be negative');
    });

    it('should handle subtracting zero', () => {
      const price1 = new Price(19.99);
      const price2 = new Price(0);
      const result = price1.subtract(price2);
      expect(result.getValue()).toBe(19.99);
    });
  });

  describe('multiply', () => {
    it('should multiply price by number correctly', () => {
      const price = new Price(10.00);
      const result = price.multiply(2.5);
      expect(result.getValue()).toBe(25.00);
    });

    it('should handle multiplication by zero', () => {
      const price = new Price(19.99);
      const result = price.multiply(0);
      expect(result.getValue()).toBe(0);
    });

    it('should throw error for negative multiplier', () => {
      const price = new Price(10.00);
      expect(() => price.multiply(-1)).toThrow('Multiplier cannot be negative');
    });

    it('should handle decimal multipliers', () => {
      const price = new Price(10.00);
      const result = price.multiply(0.5);
      expect(result.getValue()).toBe(5.00);
    });
  });

  describe('applyDiscount', () => {
    it('should apply percentage discount correctly', () => {
      const price = new Price(100.00);
      const result = price.applyDiscount(20); // 20% discount
      expect(result.getValue()).toBe(80.00);
    });

    it('should handle zero discount', () => {
      const price = new Price(100.00);
      const result = price.applyDiscount(0);
      expect(result.getValue()).toBe(100.00);
    });

    it('should throw error for negative discount', () => {
      const price = new Price(100.00);
      expect(() => price.applyDiscount(-10)).toThrow('Discount percentage cannot be negative');
    });

    it('should throw error for discount over 100%', () => {
      const price = new Price(100.00);
      expect(() => price.applyDiscount(110)).toThrow('Discount percentage cannot exceed 100%');
    });

    it('should handle 100% discount', () => {
      const price = new Price(100.00);
      const result = price.applyDiscount(100);
      expect(result.getValue()).toBe(0);
    });
  });
}); 