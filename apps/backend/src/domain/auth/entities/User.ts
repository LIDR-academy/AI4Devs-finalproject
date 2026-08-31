import { Pin } from '../value-objects/Pin.js';
import { UserBlockedException } from '../errors/UserBlockedException.js';

export type UserRole = string;
export type UserStatusType = 'ACTIVE' | 'BLOCKED';

export interface UserProps {
  id: string;
  name: string;
  role: UserRole;
  pin: Pin;
  status: UserStatusType;
  mustChangePin?: boolean;
  failedAttempts: number;
  email?: string;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  createdAt?: Date;
}

export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = {
      mustChangePin: true,
      ...props,
    };
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get role(): UserRole {
    return this.props.role;
  }

  public get pin(): Pin {
    return this.props.pin;
  }

  public get status(): UserStatusType {
    return this.props.status;
  }

  public get mustChangePin(): boolean {
    return this.props.mustChangePin ?? true;
  }

  public get failedAttempts(): number {
    return this.props.failedAttempts;
  }

  public get email(): string | undefined {
    return this.props.email;
  }

  public get resetTokenHash(): string | undefined {
    return this.props.resetTokenHash;
  }

  public get resetTokenExpires(): Date | undefined {
    return this.props.resetTokenExpires;
  }

  public isBlocked(): boolean {
    return this.props.status === 'BLOCKED';
  }

  public recordFailedAttempt(): void {
    this.props.failedAttempts += 1;
    if (this.props.failedAttempts >= 5) {
      this.props.status = 'BLOCKED';
    }
  }

  public resetFailedAttempts(): void {
    this.props.failedAttempts = 0;
  }

  public block(): void {
    this.props.status = 'BLOCKED';
  }

  public activate(): void {
    this.props.status = 'ACTIVE';
    this.props.failedAttempts = 0;
  }

  public validatePin(rawPin: string): boolean {
    if (this.isBlocked()) {
      throw new UserBlockedException(this.props.name);
    }

    const isValid = this.props.pin.compareWithRaw(rawPin);
    if (!isValid) {
      this.recordFailedAttempt();
    } else {
      this.resetFailedAttempts();
    }
    return isValid;
  }

  public changePin(newPin: Pin): void {
    this.props.pin = newPin;
    this.props.mustChangePin = false;
  }

  public setResetToken(tokenHash: string, expiresAt: Date): void {
    this.props.resetTokenHash = tokenHash;
    this.props.resetTokenExpires = expiresAt;
  }

  public clearResetToken(): void {
    this.props.resetTokenHash = undefined;
    this.props.resetTokenExpires = undefined;
  }

  public resetPin(newPin: Pin): void {
    this.props.pin = newPin;
    this.props.mustChangePin = false;
    this.props.status = 'ACTIVE';
    this.props.failedAttempts = 0;
    this.clearResetToken();
  }

  public updateDetails(name?: string, role?: string, newPin?: Pin, email?: string): void {
    if (name) this.props.name = name;
    if (role) this.props.role = role;
    if (email !== undefined) this.props.email = email;
    if (newPin) {
      this.props.pin = newPin;
      this.props.mustChangePin = false;
    }
  }
}

