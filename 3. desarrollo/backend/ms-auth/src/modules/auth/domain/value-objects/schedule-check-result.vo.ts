/**
 * Value Object que representa el resultado de verificación de horario
 */
export class ScheduleCheckResult {
  private constructor(
    public readonly allowed: boolean,
    public readonly message: string,
    public readonly horaInicio?: string,
    public readonly horaFin?: string,
    public readonly isTemporaryAuth?: boolean,
  ) {}

  /**
   * Crea un resultado de acceso permitido
   */
  static allowed(message?: string): ScheduleCheckResult {
    return new ScheduleCheckResult(
      true,
      message || 'Acceso permitido',
    );
  }

  /**
   * Crea un resultado de acceso denegado
   */
  static denied(
    message: string,
    horaInicio?: string,
    horaFin?: string,
  ): ScheduleCheckResult {
    return new ScheduleCheckResult(
      false,
      message,
      horaInicio,
      horaFin,
      false,
    );
  }

  /**
   * Crea un resultado de acceso temporal autorizado
   */
  static temporaryAuth(message: string): ScheduleCheckResult {
    return new ScheduleCheckResult(
      true,
      message,
      undefined,
      undefined,
      true,
    );
  }
}

