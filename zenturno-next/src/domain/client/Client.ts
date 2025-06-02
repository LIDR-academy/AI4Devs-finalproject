/**
 * Client domain entity
 * Represents a client in the system
 */
import { User } from '../user/User';

export class Client {
  private readonly id: number;
  private name: string;
  private phone: string | null;
  private userId: number | null;
  private readonly createdAt: Date;
  private updatedAt: Date;
  
  private constructor(
    id: number,
    name: string,
    phone: string | null,
    userId: number | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.phone = phone;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  
  /**
   * Creates a Client entity from raw input
   * @param params Client creation parameters
   * @returns Client entity
   */
  public static create(params: {
    id?: number;
    name: string;
    phone?: string | null;
    userId?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Client {
    if (!params.name) {
      throw new Error('Client name is required');
    }
    
    return new Client(
      params.id ?? 0,
      params.name,
      params.phone ?? null,
      params.userId ?? null,
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date()
    );
  }
  
  /**
   * Creates a Client entity from a database row
   * @param row Database row
   * @returns Client entity
   */
  public static fromDatabaseRow(row: {
    id: number;
    name: string;
    phone: string | null;
    user_id: number | null;
    created_at: string;
    updated_at: string;
  }): Client {
    return new Client(
      row.id,
      row.name,
      row.phone,
      row.user_id,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
  
  /**
   * Creates a Client entity from a User entity
   * @param user User entity
   * @param phone Optional phone number
   * @returns Client entity
   */
  public static fromUser(user: User, phone?: string): Client {
    return Client.create({
      name: user.getName(),
      phone: phone ?? null,
      userId: user.getId() ?? null
    });
  }
  
  /**
   * Converts the Client entity to a database DTO for insertion
   * @returns Database insert DTO
   */
  public toDatabaseInsertDto(): {
    name: string;
    phone: string | null;
    user_id: number | null;
  } {
    return {
      name: this.name,
      phone: this.phone,
      user_id: this.userId
    };
  }
  
  /**
   * Converts the Client entity to a database DTO for update
   * @returns Database update DTO
   */
  public toDatabaseUpdateDto(): {
    name?: string;
    phone?: string | null;
    user_id?: number | null;
    updated_at: string;
  } {
    return {
      name: this.name,
      phone: this.phone,
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
  
  public getPhone(): string | null {
    return this.phone;
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
      throw new Error('Client name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }
  
  public setPhone(phone: string | null): void {
    this.phone = phone;
    this.updatedAt = new Date();
  }
  
  public setUserId(userId: number | null): void {
    this.userId = userId;
    this.updatedAt = new Date();
  }
}
