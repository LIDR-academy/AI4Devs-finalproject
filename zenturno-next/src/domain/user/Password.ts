import bcrypt from 'bcryptjs';

/**
 * Password value object
 * Represents a password in the system with validation and hashing capabilities
 */
export class Password {
  private readonly value: string;
  private readonly isHashed: boolean;
  
  private constructor(password: string, isHashed: boolean) {
    this.value = password;
    this.isHashed = isHashed;
  }
  
  /**
   * Creates a new Password instance after validating the input
   * @param password The password string to validate
   * @returns Password instance
   * @throws Error if password is invalid
   */
  public static create(password: string): Password {
    if (!password) {
      throw new Error('Password is required');
    }
    
    if (!Password.isValid(password)) {
      throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number');
    }
    
    return new Password(password, false);
  }
  
  /**
   * Creates a Password instance from an already hashed password
   * @param hashedPassword The hashed password string
   * @returns Password instance
   */
  public static fromHashed(hashedPassword: string): Password {
    if (!hashedPassword) {
      throw new Error('Hashed password is required');
    }
    
    return new Password(hashedPassword, true);
  }
  
  /**
   * Validates password format
   * @param password The password to validate
   * @returns boolean indicating if password is valid
   */
  public static isValid(password: string): boolean {
    // Password must be at least 8 characters long and contain at least
    // one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
  
  /**
   * Returns the password value
   */
  public getValue(): string {
    return this.value;
  }
  
  /**
   * Checks if the password is already hashed
   */
  public isAlreadyHashed(): boolean {
    return this.isHashed;
  }
  
  /**
   * Hashes the password if it's not already hashed
   * @returns Promise resolving to a hashed Password instance
   */
  public async hash(): Promise<Password> {
    if (this.isHashed) {
      return this;
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.value, salt);
    
    return Password.fromHashed(hashedPassword);
  }
  
  /**
   * Compares a plain password with this password
   * @param plainPassword The plain password to compare
   * @returns Promise resolving to boolean indicating if passwords match
   */
  public async compare(plainPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      throw new Error('Cannot compare with a non-hashed password');
    }
    
    return bcrypt.compare(plainPassword, this.value);
  }
}
