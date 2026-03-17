/**
 * Professional domain entity
 * Represents a professional service provider in the system
 */
import { User } from '../user/User';

export class Professional {
  private readonly id: number;
  private name: string;
  private specialty: string | null;
  private userId: number | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  
  private constructor(
    id: number,
    name: string,
    specialty: string | null,
    userId: number | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.specialty = specialty;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  
  /**
   * Creates a Professional entity from raw input
   * @param params Professional creation parameters
   * @returns Professional entity
   */
  public static create(params: {
    id?: number;
    name: string;
    specialty?: string | null;
    userId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Professional {
    if (!params.name) {
      throw new Error('Professional name is required');
    }
    
    return new Professional(
      params.id ?? 0,
      params.name,
      params.specialty ?? null,
      params.userId ?? null,
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date()
    );
  }
  
  /**
   * Creates a Professional entity from a database row
   * @param row Database row
   * @returns Professional entity
   */
  public static fromDatabaseRow(row: {
    id: number;
    name: string;
    specialty: string | null;
    user_id: number | null;
    created_at: string;
    updated_at: string;
  }): Professional {
    return new Professional(
      row.id,
      row.name,
      row.specialty,
      row.user_id,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
  
  /**
   * Creates a Professional entity from a User entity
   * @param user User entity
   * @param specialty Professional specialty
   * @returns Professional entity
   */
  public static fromUser(user: User, specialty?: string): Professional {
    return Professional.create({
      name: user.getName(),
      specialty: specialty ?? null,
      userId: user.getId() ?? null
    });
  }
  
  /**
   * Converts the Professional entity to a database DTO for insertion
   * @returns Database insert DTO
   */
  public toDatabaseInsertDto(): {
    name: string;
    specialty: string | null;
    user_id: number | null;
  } {
    return {
      name: this.name,
      specialty: this.specialty,
      user_id: this.userId
    };
  }
  
  /**
   * Converts the Professional entity to a database DTO for update
   * @returns Database update DTO
   */
  public toDatabaseUpdateDto(): {
    name?: string;
    specialty?: string | null;
    user_id?: number | null;
    updated_at: string;
  } {
    return {
      name: this.name,
      specialty: this.specialty,
      user_id: this.userId,
      updated_at: new Date().toISOString()
    };
  }
  
  // Getters
  public getId(): number {
    return this.id;
  }
  
  public getName(): string {
    return this.name;
  }
  
  public getSpecialty(): string | null {
    return this.specialty;
  }
  
  public getUserId(): number | null {
    return this.userId;
  }
  
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  
  // Setters
  public setName(name: string): void {
    if (!name) {
      throw new Error('Professional name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }
  
  public setSpecialty(specialty: string | null): void {
    this.specialty = specialty;
    this.updatedAt = new Date();
  }
  
  public setUserId(userId: number | null): void {
    this.userId = userId;
    this.updatedAt = new Date();
  }
}
