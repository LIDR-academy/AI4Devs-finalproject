import { LockoutPolicy } from './lockout-policy.vo';

describe('LockoutPolicy', () => {
  describe('isPermanentLockout', () => {
    it('debe retornar true cuando lockoutMinutes es 0', () => {
      const policy = new LockoutPolicy(5, 0, 15);

      expect(policy.isPermanentLockout()).toBe(true);
    });

    it('debe retornar false cuando lockoutMinutes es mayor a 0', () => {
      const policy = new LockoutPolicy(5, 30, 15);

      expect(policy.isPermanentLockout()).toBe(false);
    });
  });

  describe('calculateLockoutUntil', () => {
    it('debe retornar null para bloqueo permanente', () => {
      const policy = new LockoutPolicy(5, 0, 15);
      const firstAttempt = new Date('2024-01-15T10:00:00Z');

      const result = policy.calculateLockoutUntil(firstAttempt);

      expect(result).toBeNull();
    });

    it('debe calcular fecha de desbloqueo correctamente', () => {
      const policy = new LockoutPolicy(5, 30, 15);
      const firstAttempt = new Date('2024-01-15T10:00:00Z');

      const result = policy.calculateLockoutUntil(firstAttempt);

      expect(result).not.toBeNull();
      expect(result!.getTime()).toBe(
        firstAttempt.getTime() + 30 * 60 * 1000,
      );
    });
  });

  describe('shouldResetAttempts', () => {
    it('debe retornar true si la ventana ha expirado', () => {
      const policy = new LockoutPolicy(5, 30, 15);
      const firstAttempt = new Date(Date.now() - 20 * 60 * 1000); // 20 min atrás

      const result = policy.shouldResetAttempts(firstAttempt);

      expect(result).toBe(true);
    });

    it('debe retornar false si la ventana no ha expirado', () => {
      const policy = new LockoutPolicy(5, 30, 15);
      const firstAttempt = new Date(Date.now() - 5 * 60 * 1000); // 5 min atrás

      const result = policy.shouldResetAttempts(firstAttempt);

      expect(result).toBe(false);
    });
  });
});

