import { PasswordPolicy } from './password-policy.vo';
import { ValidationResult } from './validation-result.vo';

describe('PasswordPolicy', () => {
  describe('validate', () => {
    it('debe validar contraseña que cumple todos los requisitos', () => {
      const policy = new PasswordPolicy(
        8,
        128,
        true,
        true,
        true,
        true,
        90,
        5,
      );

      const result = policy.validate('TestPassword123!');

      expect(result.isValid).toBe(true);
      expect(result.hasErrors()).toBe(false);
    });

    it('debe rechazar contraseña menor a longitud mínima', () => {
      const policy = new PasswordPolicy(8, 128, true, true, true, true, 90, 5);

      const result = policy.validate('Short1!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('al menos 8 caracteres'),
      );
    });

    it('debe rechazar contraseña mayor a longitud máxima', () => {
      const policy = new PasswordPolicy(8, 10, true, true, true, true, 90, 5);

      const result = policy.validate('VeryLongPassword123!');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('no puede exceder'),
      );
    });

    it('debe validar correctamente cuando no se requieren mayúsculas', () => {
      const policy = new PasswordPolicy(
        8,
        128,
        false, // no requiere mayúscula
        true,
        true,
        true,
        90,
        5,
      );

      const result = policy.validate('testpassword123!');

      expect(result.isValid).toBe(true);
    });

    it('debe validar correctamente cuando no se requieren minúsculas', () => {
      const policy = new PasswordPolicy(
        8,
        128,
        true,
        false, // no requiere minúscula
        true,
        true,
        90,
        5,
      );

      const result = policy.validate('TESTPASSWORD123!');

      expect(result.isValid).toBe(true);
    });

    it('debe validar correctamente cuando no se requieren números', () => {
      const policy = new PasswordPolicy(
        8,
        128,
        true,
        true,
        false, // no requiere número
        true,
        90,
        5,
      );

      const result = policy.validate('TestPassword!');

      expect(result.isValid).toBe(true);
    });

    it('debe validar correctamente cuando no se requieren caracteres especiales', () => {
      const policy = new PasswordPolicy(
        8,
        128,
        true,
        true,
        true,
        false, // no requiere especial
        90,
        5,
      );

      const result = policy.validate('TestPassword123');

      expect(result.isValid).toBe(true);
    });
  });
});

