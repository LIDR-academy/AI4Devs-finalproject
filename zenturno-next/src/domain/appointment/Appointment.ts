/**
 * Appointment domain entity
 * Represents a booking in the system
 */
import { Client } from '../client/Client';
import { Professional } from '../professional/Professional';
import { Service } from '../service/Service';

// Define valid appointment status values
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export class Appointment {
  private readonly id: number;
  private dateTime: Date;
  private clientId: number | null;
  private professionalId: number | null;
  private serviceId: number | null;
  private status: AppointmentStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;
  
  // Optional references to related entities
  private client?: Client;
  private professional?: Professional;
  private service?: Service;
  
  private constructor(
    id: number,
    dateTime: Date,
    clientId: number | null,
    professionalId: number | null,
    serviceId: number | null,
    status: AppointmentStatus,
    createdAt: Date,
    updatedAt: Date,
    client?: Client,
    professional?: Professional,
    service?: Service
  ) {
    this.id = id;
    this.dateTime = dateTime;
    this.clientId = clientId;
    this.professionalId = professionalId;
    this.serviceId = serviceId;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.client = client;
    this.professional = professional;
    this.service = service;
  }
  
  /**
   * Creates an Appointment entity from raw input
   * @param params Appointment creation parameters
   * @returns Appointment entity
   */
  public static create(params: {
    id?: number;
    dateTime: Date;
    clientId?: number | null;
    professionalId?: number | null;
    serviceId?: number | null;
    status?: AppointmentStatus;
    createdAt?: Date;
    updatedAt?: Date;
    client?: Client;
    professional?: Professional;
    service?: Service;
  }): Appointment {
    if (!params.dateTime) {
      throw new Error('Appointment date and time is required');
    }
    
    // Validate date is in the future
    if (params.dateTime < new Date()) {
      throw new Error('Appointment date and time must be in the future');
    }
    
    return new Appointment(
      params.id ?? 0,
      params.dateTime,
      params.clientId ?? null,
      params.professionalId ?? null,
      params.serviceId ?? null,
      params.status ?? 'pending',
      params.createdAt ?? new Date(),
      params.updatedAt ?? new Date(),
      params.client,
      params.professional,
      params.service
    );
  }
  
  /**
   * Creates an Appointment entity from a database row
   * @param row Database row
   * @returns Appointment entity
   */
  public static fromDatabaseRow(row: {
    id: number;
    date: string;
    client_id: number | null;
    professional_id: number | null;
    service_id: number | null;
    status: string;
    created_at: string;
    updated_at: string;
  }): Appointment {
    return new Appointment(
      row.id,
      new Date(row.date),
      row.client_id,
      row.professional_id,
      row.service_id,
      row.status as AppointmentStatus,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }
  
  /**
   * Converts the Appointment entity to a database DTO for insertion
   * @returns Database insert DTO
   */
  public toDatabaseInsertDto(): {
    date_time: string;
    client_id: number | null;
    professional_id: number | null;
    service_id: number | null;
    status: string;
  } {
    return {
      date_time: this.dateTime.toISOString(),
      client_id: this.clientId,
      professional_id: this.professionalId,
      service_id: this.serviceId,
      status: this.status
    };
  }
  
  /**
   * Converts the Appointment entity to a database DTO for update
   * @returns Database update DTO
   */
  public toDatabaseUpdateDto(): {
    date_time?: string;
    client_id?: number | null;
    professional_id?: number | null;
    service_id?: number | null;
    status?: string;
    updated_at: string;
  } {
    return {
      date_time: this.dateTime.toISOString(),
      client_id: this.clientId,
      professional_id: this.professionalId,
      service_id: this.serviceId,
      status: this.status,
      updated_at: new Date().toISOString()
    };
  }
  
  /**
   * Sets the related client entity
   * @param client Client entity
   */
  public setClientEntity(client: Client): void {
    this.client = client;
    this.clientId = client.getId();
    this.updatedAt = new Date();
  }
  
  /**
   * Sets the related professional entity
   * @param professional Professional entity
   */
  public setProfessionalEntity(professional: Professional): void {
    this.professional = professional;
    this.professionalId = professional.getId();
    this.updatedAt = new Date();
  }
  
  /**
   * Sets the related service entity
   * @param service Service entity
   */
  public setServiceEntity(service: Service): void {
    this.service = service;
    this.serviceId = service.getId();
    this.updatedAt = new Date();
  }
  
  /**
   * Confirms the appointment
   */
  public confirm(): void {
    if (this.status === 'cancelled') {
      throw new Error('Cannot confirm a cancelled appointment');
    }
    
    this.status = 'confirmed';
    this.updatedAt = new Date();
  }
  
  /**
   * Cancels the appointment
   */
  public cancel(): void {
    if (this.status === 'completed') {
      throw new Error('Cannot cancel a completed appointment');
    }
    
    this.status = 'cancelled';
    this.updatedAt = new Date();
  }
  
  /**
   * Marks the appointment as completed
   */
  public complete(): void {
    if (this.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled appointment');
    }
    
    this.status = 'completed';
    this.updatedAt = new Date();
  }
  
  /**
   * Checks if the appointment can be rescheduled
   * @returns Whether the appointment can be rescheduled
   */
  public canReschedule(): boolean {
    return this.status !== 'cancelled' && this.status !== 'completed';
  }
  
  /**
   * Formats the appointment date and time
   * @param locale Locale for formatting
   * @returns Formatted date and time string
   */
  public formatDateTime(locale: string = 'en-US'): string {
    return this.dateTime.toLocaleString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  }
  
  // Getters
  public getId(): number {
    return this.id;
  }
  
  public getDateTime(): Date {
    return this.dateTime;
  }
  
  public getClientId(): number | null {
    return this.clientId;
  }
  
  public getProfessionalId(): number | null {
    return this.professionalId;
  }
  
  public getServiceId(): number | null {
    return this.serviceId;
  }
  
  public getStatus(): AppointmentStatus {
    return this.status;
  }
  
  public getCreatedAt(): Date {
    return this.createdAt;
  }
  
  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
  
  public getClient(): Client | undefined {
    return this.client;
  }
  
  public getProfessional(): Professional | undefined {
    return this.professional;
  }
  
  public getService(): Service | undefined {
    return this.service;
  }
  
  // Setters
  public setDateTime(dateTime: Date): void {
    if (!dateTime) {
      throw new Error('Appointment date and time is required');
    }
    
    // Validate date is in the future
    if (dateTime < new Date()) {
      throw new Error('Appointment date and time must be in the future');
    }
    
    this.dateTime = dateTime;
    this.updatedAt = new Date();
  }
  
  public setClientId(clientId: number | null): void {
    this.clientId = clientId;
    // Clear the client entity if we're changing the ID
    if (this.client && this.client.getId() !== clientId) {
      this.client = undefined;
    }
    this.updatedAt = new Date();
  }
  
  public setProfessionalId(professionalId: number | null): void {
    this.professionalId = professionalId;
    // Clear the professional entity if we're changing the ID
    if (this.professional && this.professional.getId() !== professionalId) {
      this.professional = undefined;
    }
    this.updatedAt = new Date();
  }
  
  public setServiceId(serviceId: number | null): void {
    this.serviceId = serviceId;
    // Clear the service entity if we're changing the ID
    if (this.service && this.service.getId() !== serviceId) {
      this.service = undefined;
    }
    this.updatedAt = new Date();
  }
  
  public setStatus(status: AppointmentStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }
}
