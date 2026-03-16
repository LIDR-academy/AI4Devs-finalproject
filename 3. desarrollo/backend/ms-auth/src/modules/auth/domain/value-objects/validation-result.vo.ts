/**
 * Value Object que representa el resultado de una validación
 */
export class ValidationResult {
  private _errors: string[] = [];

  constructor(public readonly isValid: boolean = true) {}

  /**
   * Agrega un error al resultado
   */
  addError(message: string): void {
    this._errors.push(message);
  }

  /**
   * Obtiene todos los errores
   */
  get errors(): string[] {
    return [...this._errors];
  }

  /**
   * Verifica si hay errores
   */
  hasErrors(): boolean {
    return this._errors.length > 0;
  }

  /**
   * Obtiene el primer error
   */
  getFirstError(): string | null {
    return this._errors.length > 0 ? this._errors[0] : null;
  }

  /**
   * Crea un resultado válido
   */
  static valid(): ValidationResult {
    return new ValidationResult(true);
  }

  /**
   * Crea un resultado inválido con un error
   */
  static invalid(error: string): ValidationResult {
    const result = new ValidationResult(false);
    result.addError(error);
    return result;
  }
}

