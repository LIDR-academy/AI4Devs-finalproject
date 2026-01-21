import { ValidationResult } from './validation-result.vo';

/**
 * Value Object que representa la política de contraseñas
 */
export class PasswordPolicy {
  constructor(
    public readonly minLength: number,
    public readonly maxLength: number,
    public readonly requireUppercase: boolean,
    public readonly requireLowercase: boolean,
    public readonly requireNumber: boolean,
    public readonly requireSpecial: boolean,
    public readonly expiryDays: number,
    public readonly historyCount: number,
  ) {}

  /**
   * Valida una contraseña contra la política
   */
  validate(password: string): ValidationResult {
    const result = new ValidationResult();

    // Validar longitud mínima
    if (password.length < this.minLength) {
      result.addError(
        `La contraseña debe tener al menos ${this.minLength} caracteres`,
      );
    }

    // Validar longitud máxima
    if (password.length > this.maxLength) {
      result.addError(
        `La contraseña no puede exceder ${this.maxLength} caracteres`,
      );
    }

    // Validar mayúsculas
    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      result.addError(
        'La contraseña debe contener al menos una mayúscula',
      );
    }

    // Validar minúsculas
    if (this.requireLowercase && !/[a-z]/.test(password)) {
      result.addError(
        'La contraseña debe contener al menos una minúscula',
      );
    }

    // Validar números
    if (this.requireNumber && !/\d/.test(password)) {
      result.addError('La contraseña debe contener al menos un número');
    }

    // Validar caracteres especiales
    if (this.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      result.addError(
        'La contraseña debe contener al menos un carácter especial',
      );
    }

    return result;
  }
}

