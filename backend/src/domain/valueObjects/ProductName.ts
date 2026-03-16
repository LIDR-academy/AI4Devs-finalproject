export class ProductName {
  private readonly value: string;
  private static readonly MIN_LENGTH = 2;
  private static readonly MAX_LENGTH = 200;

  constructor(name: string) {
    this.value = this.sanitizeAndValidate(name);
  }

  private sanitizeAndValidate(name: string): string {
    if (!name || name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }

    // Sanitize input
    let sanitized = this.sanitize(name.trim());
    
    // Validate length
    if (sanitized.length < ProductName.MIN_LENGTH) {
      throw new Error('Product name must be at least 2 characters long');
    }

    if (sanitized.length > ProductName.MAX_LENGTH) {
      throw new Error('Product name cannot exceed 200 characters');
    }

    return sanitized;
  }

  private sanitize(input: string): string {
    let sanitized = input
      // Remove dangerous HTML tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      // Remove SQL injection attempts
      .replace(/DROP\s+TABLE/gi, '')
      .replace(/DELETE\s+FROM/gi, '')
      .replace(/INSERT\s+INTO/gi, '')
      .replace(/UPDATE\s+SET/gi, '')
      .replace(/--/g, '')
      .replace(/;/g, '')
      // Clean up whitespace
      .replace(/\s+/g, ' ')
      .trim();

    // Check if input has mixed case (both upper and lower in wrong places)
    const hasMixedCase = this.hasMixedCase(sanitized);
    
    if (hasMixedCase) {
      // Convert to proper Title Case
      sanitized = sanitized
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    return sanitized;
  }

  private hasMixedCase(text: string): boolean {
    // Check if text has unusual casing patterns (like "pARMIGIANO")
    const words = text.split(' ');
    return words.some(word => {
      if (word.length <= 1) return false;
      
      // Check if first char is lowercase and rest has uppercase
      const firstIsLower = word[0] === word[0].toLowerCase();
      const hasUpperInRest = word.slice(1).split('').some(char => char === char.toUpperCase() && char !== char.toLowerCase());
      
      // Or if it's all uppercase (more than 3 chars)
      const isAllUpper = word.length > 3 && word === word.toUpperCase();
      
      return (firstIsLower && hasUpperInRest) || isAllUpper;
    });
  }

  getValue(): string {
    return this.value;
  }

  static fromString(name: string): ProductName {
    return new ProductName(name);
  }

  static isValid(name: string): boolean {
    try {
      new ProductName(name);
      return true;
    } catch {
      return false;
    }
  }

  equals(other: ProductName): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toString(): string {
    return this.value;
  }

  contains(substring: string): boolean {
    return this.value.toLowerCase().includes(substring.toLowerCase());
  }

  startsWith(prefix: string): boolean {
    return this.value.toLowerCase().startsWith(prefix.toLowerCase());
  }

  getLength(): number {
    return this.value.length;
  }

  toSlug(): string {
    return this.value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }
} 