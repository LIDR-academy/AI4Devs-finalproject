/**
 * Email value object
 * Represents a valid email address in the system
 */
export class Email {
  private readonly value: string;
  
  private constructor(email: string) {
    this.value = email;
  }
  
  /**
   * Creates a new Email instance after validating the input
   * @param email The email string to validate
   * @returns Email instance
   * @throws Error if email is invalid
   */
  public static create(email: string): Email {
    if (!email) {
      throw new Error('Email is required');
    }
    
    if (!Email.isValid(email)) {
      throw new Error('Invalid email format');
    }
    
    return new Email(email);
  }
  
  /**
   * Validates email format
   * @param email The email to validate
   * @returns boolean indicating if email is valid
   */
  public static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Returns the email value
   */
  public getValue(): string {
    return this.value;
  }
  
  /**
   * Checks if two Email objects are equal
   * @param other Another Email object to compare with
   * @returns boolean indicating if emails are equal
   */
  public equals(other: Email): boolean {
    return this.value.toLowerCase() === other.getValue().toLowerCase();
  }
}
