/**
 * Service domain entity
 * Represents a service offered by professionals in the system
 */
export class Service {
  private readonly id: number;
  private name: string;
  private price: number;
  private durationMinutes: number;
  private readonly createdAt: Date;
  private updatedAt: Date;
  
  private constructor(
    id: number,
    name: string,
    price: number,
    durationMinutes: number,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.durationMinutes = durationMinutes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
  
  /**
   * Creates a Service entity from raw input
   * @param params Service creation parameters
   * @returns Service entity
   */
  public static create(params: {
    id?: number;
    name: string;
    price: number;
    durationMinutes: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Service {
    if (!params.name) {
      throw new Error('Service name is required');
    }
    
    if (params.price < 0) {
      throw new Error('Service price must be non-negative');
    }
    
    if (params.durationMinutes <= 0) {
      throw new Error('Service duration must be positive');
    }
    
    return new Service(
      params.id ?? 0,
      params.name,
      params.price,
      params.durationMinutes,
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date()
    );
  }
  
  /**
   * Creates a Service entity from a database row
   * @param row Database row
   * @returns Service entity
   */
  public static fromDatabaseRow(row: {
    id: number;
    name: string;
    price: number;
    duration_minutes: number;
    created_at: string;
    updated_at: string;
  }): Service {
    return new Service(
      row.id,
      row.name,
      row.price,
      row.duration_minutes,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
  
  /**
   * Converts the Service entity to a database DTO for insertion
   * @returns Database insert DTO
   */
  public toDatabaseInsertDto(): {
    name: string;
    price: number;
    duration_minutes: number;
  } {
    return {
      name: this.name,
      price: this.price,
      duration_minutes: this.durationMinutes
    };
  }
  
  /**
   * Converts the Service entity to a database DTO for update
   * @returns Database update DTO
   */
  public toDatabaseUpdateDto(): {
    name?: string;
    price?: number;
    duration_minutes?: number;
    updated_at: string;
  } {
    return {
      name: this.name,
      price: this.price,
      duration_minutes: this.durationMinutes,
      updated_at: new Date().toISOString()
    };
  }
  
  /**
   * Formats the price as a currency string
   * @param locale Locale for formatting
   * @param currency Currency code
   * @returns Formatted price string
   */
  public formatPrice(locale: string = 'en-US', currency: string = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(this.price);
  }
  
  /**
   * Formats the duration as a string
   * @returns Formatted duration string
   */
  public formatDuration(): string {
    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    
    return `${minutes}m`;
  }
  
  // Getters
  public getId(): number {
    return this.id;
  }
  
  public getName(): string {
    return this.name;
  }
  
  public getPrice(): number {
    return this.price;
  }
  
  public getDurationMinutes(): number {
    return this.durationMinutes;
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
      throw new Error('Service name is required');
    }
    this.name = name;
    this.updatedAt = new Date();
  }
  
  public setPrice(price: number): void {
    if (price < 0) {
      throw new Error('Service price must be non-negative');
    }
    this.price = price;
    this.updatedAt = new Date();
  }
  
  public setDurationMinutes(durationMinutes: number): void {
    if (durationMinutes <= 0) {
      throw new Error('Service duration must be positive');
    }
    this.durationMinutes = durationMinutes;
    this.updatedAt = new Date();
  }
}
