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
  failedAttempts: number;
  createdAt?: Date;
}

export class User {
  private readonly props: UserProps;

  constructor(props: UserProps) {
    this.props = { ...props };
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

  // Bloqueo/activacion administrativa (Guard: gestion minima de personal, TK-049) — distinto
  // del bloqueo automatico por 5 intentos fallidos, pero mismo status: un ADMIN puede
  // desactivar a un operario que deja el restaurante, o reactivar a uno bloqueado por error.
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
}
