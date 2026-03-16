import { ProductName } from '../../../../src/domain/valueObjects/ProductName';

describe('ProductName Value Object', () => {
  describe('constructor', () => {
    it('should create a valid ProductName with normal text', () => {
      const name = 'Parmigiano Reggiano DOP';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe(name);
    });

    it('should create a valid ProductName with Italian characters', () => {
      const name = 'Prosciutto di Parma';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe(name);
    });

    it('should create a valid ProductName with numbers', () => {
      const name = 'Chianti Classico 2020';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe(name);
    });

    it('should throw error for empty string', () => {
      expect(() => new ProductName('')).toThrow('Product name cannot be empty');
    });

    it('should throw error for null or undefined', () => {
      expect(() => new ProductName(null as any)).toThrow('Product name cannot be empty');
      expect(() => new ProductName(undefined as any)).toThrow('Product name cannot be empty');
    });

    it('should throw error for whitespace only', () => {
      expect(() => new ProductName('   ')).toThrow('Product name cannot be empty');
      expect(() => new ProductName('\t\n')).toThrow('Product name cannot be empty');
    });

    it('should throw error for names that are too short', () => {
      expect(() => new ProductName('A')).toThrow('Product name must be at least 2 characters long');
      expect(() => new ProductName('AB')).not.toThrow();
    });

    it('should throw error for names that are too long', () => {
      const longName = 'A'.repeat(201); // Assuming max length is 200
      expect(() => new ProductName(longName)).toThrow('Product name cannot exceed 200 characters');
    });

    it('should handle names at maximum length', () => {
      const maxLengthName = 'A'.repeat(200);
      expect(() => new ProductName(maxLengthName)).not.toThrow();
    });

    it('should trim whitespace from name', () => {
      const name = '  Parmigiano Reggiano  ';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe('Parmigiano Reggiano');
    });
  });

  describe('sanitize', () => {
    it('should remove dangerous HTML tags', () => {
      const name = 'Parmigiano<script>alert("xss")</script>Reggiano';
      const productName = new ProductName(name);
      expect(productName.getValue()).not.toContain('<script>');
      expect(productName.getValue()).not.toContain('</script>');
    });

    it('should remove SQL injection attempts', () => {
      const name = "Parmigiano'; DROP TABLE products; --";
      const productName = new ProductName(name);
      expect(productName.getValue()).not.toContain('DROP TABLE');
      expect(productName.getValue()).not.toContain('--');
    });

    it('should preserve safe special characters', () => {
      const name = 'Parmigiano-Reggiano DOP (24 mesi)';
      const productName = new ProductName(name);
      expect(productName.getValue()).toContain('-');
      expect(productName.getValue()).toContain('(');
      expect(productName.getValue()).toContain(')');
    });

    it('should handle accented characters', () => {
      const name = 'Parmigiano Reggiano DOP - Stagionato 24 mesi';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe(name);
    });

    it('should remove excessive whitespace', () => {
      const name = 'Parmigiano    Reggiano     DOP';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe('Parmigiano Reggiano DOP');
    });

    it('should handle mixed case properly', () => {
      const name = 'pARMIGIANO rEGGIANO dop';
      const productName = new ProductName(name);
      expect(productName.getValue()).toBe('Parmigiano Reggiano Dop');
    });
  });

  describe('equals', () => {
    it('should return true for equal product names', () => {
      const name = 'Parmigiano Reggiano DOP';
      const productName1 = new ProductName(name);
      const productName2 = new ProductName(name);
      expect(productName1.equals(productName2)).toBe(true);
    });

    it('should return false for different product names', () => {
      const productName1 = new ProductName('Parmigiano Reggiano DOP');
      const productName2 = new ProductName('Gorgonzola DOP');
      expect(productName1.equals(productName2)).toBe(false);
    });

    it('should handle case insensitive comparison', () => {
      const productName1 = new ProductName('Parmigiano Reggiano DOP');
      const productName2 = new ProductName('parmigiano reggiano dop');
      expect(productName1.equals(productName2)).toBe(true);
    });

    it('should handle whitespace differences', () => {
      const productName1 = new ProductName('Parmigiano Reggiano DOP');
      const productName2 = new ProductName('  Parmigiano Reggiano DOP  ');
      expect(productName1.equals(productName2)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should return the product name string', () => {
      const name = 'Parmigiano Reggiano DOP';
      const productName = new ProductName(name);
      expect(productName.toString()).toBe(name);
    });

    it('should return sanitized name', () => {
      const name = '  Parmigiano   Reggiano  ';
      const productName = new ProductName(name);
      expect(productName.toString()).toBe('Parmigiano Reggiano');
    });
  });

  describe('contains', () => {
    it('should return true when name contains substring', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.contains('Parmigiano')).toBe(true);
      expect(productName.contains('Reggiano')).toBe(true);
      expect(productName.contains('DOP')).toBe(true);
    });

    it('should return false when name does not contain substring', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.contains('Gorgonzola')).toBe(false);
      expect(productName.contains('Mozzarella')).toBe(false);
    });

    it('should handle case insensitive search', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.contains('parmigiano')).toBe(true);
      expect(productName.contains('REGGIANO')).toBe(true);
      expect(productName.contains('dop')).toBe(true);
    });

    it('should handle partial matches', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.contains('Parmi')).toBe(true);
      expect(productName.contains('giano')).toBe(true);
    });
  });

  describe('startsWith', () => {
    it('should return true when name starts with prefix', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.startsWith('Parmigiano')).toBe(true);
      expect(productName.startsWith('Parmi')).toBe(true);
    });

    it('should return false when name does not start with prefix', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.startsWith('Reggiano')).toBe(false);
      expect(productName.startsWith('DOP')).toBe(false);
    });

    it('should handle case insensitive check', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.startsWith('parmigiano')).toBe(true);
      expect(productName.startsWith('PARMI')).toBe(true);
    });
  });

  describe('getLength', () => {
    it('should return the correct length', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.getLength()).toBe('Parmigiano Reggiano DOP'.length);
    });

    it('should return length after sanitization', () => {
      const productName = new ProductName('  Parmigiano   Reggiano  ');
      expect(productName.getLength()).toBe('Parmigiano Reggiano'.length);
    });
  });

  describe('toSlug', () => {
    it('should create URL-friendly slug', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP');
      expect(productName.toSlug()).toBe('parmigiano-reggiano-dop');
    });

    it('should handle special characters', () => {
      const productName = new ProductName('Parmigiano-Reggiano (24 mesi)');
      expect(productName.toSlug()).toBe('parmigiano-reggiano-24-mesi');
    });

    it('should handle accented characters', () => {
      const productName = new ProductName('Parmigiano Reggiano DOP - Stagionato');
      expect(productName.toSlug()).toBe('parmigiano-reggiano-dop-stagionato');
    });

    it('should remove multiple spaces', () => {
      const productName = new ProductName('Parmigiano    Reggiano');
      expect(productName.toSlug()).toBe('parmigiano-reggiano');
    });
  });

  describe('isValid', () => {
    it('should return true for valid names', () => {
      expect(ProductName.isValid('Parmigiano Reggiano DOP')).toBe(true);
      expect(ProductName.isValid('Chianti Classico 2020')).toBe(true);
      expect(ProductName.isValid('AB')).toBe(true); // Minimum length
    });

    it('should return false for invalid names', () => {
      expect(ProductName.isValid('')).toBe(false);
      expect(ProductName.isValid('A')).toBe(false); // Too short
      expect(ProductName.isValid('   ')).toBe(false); // Whitespace only
      expect(ProductName.isValid('A'.repeat(201))).toBe(false); // Too long
    });

    it('should handle null and undefined', () => {
      expect(ProductName.isValid(null as any)).toBe(false);
      expect(ProductName.isValid(undefined as any)).toBe(false);
    });
  });

  describe('fromString', () => {
    it('should create ProductName from valid string', () => {
      const name = 'Parmigiano Reggiano DOP';
      const productName = ProductName.fromString(name);
      expect(productName.getValue()).toBe(name);
    });

    it('should throw error for invalid string', () => {
      expect(() => ProductName.fromString('')).toThrow('Product name cannot be empty');
      expect(() => ProductName.fromString('A')).toThrow('Product name must be at least 2 characters long');
    });

    it('should handle whitespace trimming', () => {
      const productName = ProductName.fromString('  Parmigiano Reggiano  ');
      expect(productName.getValue()).toBe('Parmigiano Reggiano');
    });
  });
}); 