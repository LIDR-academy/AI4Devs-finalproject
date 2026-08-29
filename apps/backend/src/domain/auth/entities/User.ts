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

  public updateDetails(name?: string, role?: string, newPin?: Pin): void {
    if (name) this.props.name = name;
    if (role) this.props.role = role;
    if (newPin) {
      this.props.pin = newPin;
      this.props.mustChangePin = false;
    }
  }
}

