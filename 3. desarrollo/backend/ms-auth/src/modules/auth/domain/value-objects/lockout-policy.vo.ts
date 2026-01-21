/**
 * Value Object que representa la política de bloqueo por intentos fallidos
 */
export class LockoutPolicy {
  constructor(
    public readonly maxAttempts: number,
    public readonly lockoutMinutes: number, // 0 = permanente
    public readonly windowMinutes: number,
  ) {}

  /**
   * Verifica si el bloqueo es permanente
   */
  isPermanentLockout(): boolean {
    return this.lockoutMinutes === 0;
  }

  /**
   * Calcula hasta cuándo está bloqueado el usuario
   */
  calculateLockoutUntil(firstFailedAttempt: Date): Date | null {
    if (this.isPermanentLockout()) {
      return null; // null indica bloqueo permanente
    }

    const lockoutUntil = new Date(firstFailedAttempt);
    lockoutUntil.setMinutes(lockoutUntil.getMinutes() + this.lockoutMinutes);
    return lockoutUntil;
  }

  /**
   * Verifica si se debe resetear la ventana de intentos
   */
  shouldResetAttempts(firstFailedAttempt: Date): boolean {
    const windowEnd = new Date(firstFailedAttempt);
    windowEnd.setMinutes(windowEnd.getMinutes() + this.windowMinutes);
    return new Date() > windowEnd;
  }
}

