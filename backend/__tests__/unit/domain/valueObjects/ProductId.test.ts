import { ProductId } from '../../../../src/domain/valueObjects/ProductId';

describe('ProductId Value Object', () => {
  describe('constructor', () => {
    it('should create a valid ProductId with valid UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const productId = new ProductId(validUuid);
      expect(productId.getValue()).toBe(validUuid);
    });

    it('should create a valid ProductId with another valid UUID format', () => {
      const validUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const productId = new ProductId(validUuid);
      expect(productId.getValue()).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => new ProductId('invalid-uuid')).toThrow('Invalid UUID format');
      expect(() => new ProductId('123')).toThrow('Invalid UUID format');
      expect(() => new ProductId('not-a-uuid-at-all')).toThrow('Invalid UUID format');
    });

    it('should throw error for empty string', () => {
      expect(() => new ProductId('')).toThrow('ProductId cannot be empty');
    });

    it('should throw error for null or undefined', () => {
      expect(() => new ProductId(null as any)).toThrow('ProductId cannot be empty');
      expect(() => new ProductId(undefined as any)).toThrow('ProductId cannot be empty');
    });

    it('should throw error for UUID with wrong length', () => {
      expect(() => new ProductId('123e4567-e89b-12d3-a456-42661417400')).toThrow('Invalid UUID format');
      expect(() => new ProductId('123e4567-e89b-12d3-a456-4266141740000')).toThrow('Invalid UUID format');
    });

    it('should throw error for UUID with invalid characters', () => {
      expect(() => new ProductId('123g4567-e89b-12d3-a456-426614174000')).toThrow('Invalid UUID format');
      expect(() => new ProductId('123e4567-e89b-12d3-a456-42661417400z')).toThrow('Invalid UUID format');
    });

    it('should handle uppercase UUID', () => {
      const uppercaseUuid = '123E4567-E89B-12D3-A456-426614174000';
      const productId = new ProductId(uppercaseUuid);
      expect(productId.getValue()).toBe(uppercaseUuid.toLowerCase());
    });

    it('should handle mixed case UUID', () => {
      const mixedCaseUuid = '123E4567-e89b-12D3-a456-426614174000';
      const productId = new ProductId(mixedCaseUuid);
      expect(productId.getValue()).toBe(mixedCaseUuid.toLowerCase());
    });
  });

  describe('generate', () => {
    it('should generate a valid UUID', () => {
      const productId = ProductId.generate();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(productId.getValue())).toBe(true);
    });

    it('should generate different UUIDs each time', () => {
      const productId1 = ProductId.generate();
      const productId2 = ProductId.generate();
      expect(productId1.getValue()).not.toBe(productId2.getValue());
    });

    it('should generate UUIDs with proper length', () => {
      const productId = ProductId.generate();
      expect(productId.getValue()).toHaveLength(36); // UUID length with hyphens
    });
  });

  describe('equals', () => {
    it('should return true for equal ProductIds', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const productId1 = new ProductId(uuid);
      const productId2 = new ProductId(uuid);
      expect(productId1.equals(productId2)).toBe(true);
    });

    it('should return false for different ProductIds', () => {
      const productId1 = new ProductId('123e4567-e89b-12d3-a456-426614174000');
      const productId2 = new ProductId('f47ac10b-58cc-4372-a567-0e02b2c3d479');
      expect(productId1.equals(productId2)).toBe(false);
    });

    it('should handle case insensitive comparison', () => {
      const productId1 = new ProductId('123e4567-e89b-12d3-a456-426614174000');
      const productId2 = new ProductId('123E4567-E89B-12D3-A456-426614174000');
      expect(productId1.equals(productId2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const productId = new ProductId(uuid);
      expect(productId.toString()).toBe(uuid);
    });

    it('should return lowercase UUID', () => {
      const uppercaseUuid = '123E4567-E89B-12D3-A456-426614174000';
      const productId = new ProductId(uppercaseUuid);
      expect(productId.toString()).toBe(uppercaseUuid.toLowerCase());
    });
  });

  describe('isValid', () => {
    it('should return true for valid UUIDs', () => {
      expect(ProductId.isValid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(ProductId.isValid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
      expect(ProductId.isValid('00000000-0000-0000-0000-000000000000')).toBe(true);
    });

    it('should return false for invalid UUIDs', () => {
      expect(ProductId.isValid('invalid-uuid')).toBe(false);
      expect(ProductId.isValid('123')).toBe(false);
      expect(ProductId.isValid('')).toBe(false);
      expect(ProductId.isValid('123e4567-e89b-12d3-a456-42661417400')).toBe(false);
      expect(ProductId.isValid('123g4567-e89b-12d3-a456-426614174000')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(ProductId.isValid(null as any)).toBe(false);
      expect(ProductId.isValid(undefined as any)).toBe(false);
    });

    it('should handle case insensitive validation', () => {
      expect(ProductId.isValid('123E4567-E89B-12D3-A456-426614174000')).toBe(true);
      expect(ProductId.isValid('123e4567-E89B-12d3-A456-426614174000')).toBe(true);
    });
  });

  describe('fromString', () => {
    it('should create ProductId from valid UUID string', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const productId = ProductId.fromString(uuid);
      expect(productId.getValue()).toBe(uuid);
    });

    it('should throw error for invalid UUID string', () => {
      expect(() => ProductId.fromString('invalid-uuid')).toThrow('Invalid UUID format');
    });

    it('should handle whitespace', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';
      const productId = ProductId.fromString(` ${uuid} `);
      expect(productId.getValue()).toBe(uuid);
    });
  });
}); 