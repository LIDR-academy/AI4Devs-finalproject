/**
 * UserRole value object
 * Represents a user role in the system
 */
export class UserRole {
  // Define available roles
  public static readonly ADMIN = 'admin';
  public static readonly PROFESSIONAL = 'professional';
  public static readonly CLIENT = 'client';
  
  private readonly value: string;
  
  private constructor(role: string) {
    this.value = role;
  }
  
  /**
   * Creates a new UserRole instance after validating the input
   * @param role The role string to validate
   * @returns UserRole instance
   * @throws Error if role is invalid
   */
  public static create(role: string): UserRole {
    if (!role) {
      throw new Error('Role is required');
    }
    
    const normalizedRole = role.toLowerCase();
    
    if (!UserRole.isValid(normalizedRole)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${UserRole.ADMIN}, ${UserRole.PROFESSIONAL}, ${UserRole.CLIENT}`);
    }
    
    return new UserRole(normalizedRole);
  }
  
  /**
   * Creates an admin role
   * @returns UserRole instance with admin role
   */
  public static createAdmin(): UserRole {
    return new UserRole(UserRole.ADMIN);
  }
  
  /**
   * Creates a professional role
   * @returns UserRole instance with professional role
   */
  public static createProfessional(): UserRole {
    return new UserRole(UserRole.PROFESSIONAL);
  }
  
  /**
   * Creates a client role
   * @returns UserRole instance with client role
   */
  public static createClient(): UserRole {
    return new UserRole(UserRole.CLIENT);
  }
  
  /**
   * Validates role
   * @param role The role to validate
   * @returns boolean indicating if role is valid
   */
  public static isValid(role: string): boolean {
    return [
      UserRole.ADMIN,
      UserRole.PROFESSIONAL,
      UserRole.CLIENT
    ].includes(role);
  }
  
  /**
   * Returns the role value
   */
  public getValue(): string {
    return this.value;
  }
  
  /**
   * Checks if the role is admin
   * @returns boolean indicating if role is admin
   */
  public isAdmin(): boolean {
    return this.value === UserRole.ADMIN;
  }
  
  /**
   * Checks if the role is professional
   * @returns boolean indicating if role is professional
   */
  public isProfessional(): boolean {
    return this.value === UserRole.PROFESSIONAL;
  }
  
  /**
   * Checks if the role is client
   * @returns boolean indicating if role is client
   */
  public isClient(): boolean {
    return this.value === UserRole.CLIENT;
  }
}
