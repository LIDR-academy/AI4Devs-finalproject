import { Email } from './Email';
import { Password } from './Password';
import { UserRole } from './UserRole';
import { Database } from '@/lib/supabase/database.types';

// Define the User DTO interface for database operations
export interface UserDTO {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * User entity
 * Represents a user in the system with validation and business rules
 */
export class User {
  private readonly id?: number;
  private readonly name: string;
  private readonly email: Email;
  private readonly password: Password;
  private readonly role: UserRole;
  private readonly createdAt?: Date;
  private readonly updatedAt?: Date;
  
  private constructor(
    name: string,
    email: Email,
    password: Password,
    role: UserRole,
    id?: number,
    createdAt?: string,
    updatedAt?: string
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt ? new Date(createdAt) : undefined;
    this.updatedAt = updatedAt ? new Date(updatedAt) : undefined;
  }
  
  /**
   * Creates a new User instance after validating the input
   * @param name User's name
   * @param email User's email
   * @param password User's password
   * @param role User's role
   * @returns User instance
   * @throws Error if any input is invalid
   */
  public static create(
    name: string,
    email: string,
    password: string,
    role: string
  ): User {
    if (!name) {
      throw new Error('Name is required');
    }
    
    const emailObj = Email.create(email);
    const passwordObj = Password.create(password);
    const roleObj = UserRole.create(role);
    
    return new User(name, emailObj, passwordObj, roleObj);
  }
  
  /**
   * Creates a User instance from database data
   * @param userData User data from database
   * @returns User instance
   */
  public static fromDTO(userData: UserDTO): User {
    const emailObj = Email.create(userData.email);
    const passwordObj = Password.fromHashed(userData.password);
    const roleObj = UserRole.create(userData.role);
    
    return new User(
      userData.name,
      emailObj,
      passwordObj,
      roleObj,
      userData.id,
      userData.created_at,
      userData.updated_at
    );
  }
  
  /**
   * Creates a User instance from Supabase database row
   * @param userRow User row from Supabase database
   * @returns User instance
   */
  public static fromDatabaseRow(userRow: Database['public']['Tables']['users']['Row']): User {
    const emailObj = Email.create(userRow.email);
    const passwordObj = Password.fromHashed(userRow.password);
    const roleObj = UserRole.create(userRow.role);
    
    return new User(
      userRow.name,
      emailObj,
      passwordObj,
      roleObj,
      userRow.id,
      userRow.created_at,
      userRow.updated_at
    );
  }
  
  /**
   * Converts User instance to DTO for database operations
   * @returns UserDTO object
   */
  public async toDTO(): Promise<UserDTO> {
    // If password is not hashed, hash it before returning DTO
    const hashedPassword = this.password.isAlreadyHashed()
      ? this.password
      : await this.password.hash();
    
    return {
      id: this.id,
      name: this.name,
      email: this.email.getValue(),
      password: hashedPassword.getValue(),
      role: this.role.getValue(),
      created_at: this.createdAt?.toISOString(),
      updated_at: this.updatedAt?.toISOString() || new Date().toISOString(),
    };
  }
  
  // Getters
  public getId(): number | undefined {
    return this.id;
  }
  
  public getName(): string {
    return this.name;
  }
  
  public getEmail(): Email {
    return this.email;
  }
  
  public getPassword(): Password {
    return this.password;
  }
  
  public getRole(): UserRole {
    return this.role;
  }
  
  public getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
  
  public getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }
}
