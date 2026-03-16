import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { PasswordPolicy } from '../../domain/value-objects/password-policy.vo';
import { ValidationResult } from '../../domain/value-objects/validation-result.vo';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe('hash', () => {
    it('debe generar un hash de contraseña', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$')).toBe(true);
    });
  });

  describe('compare', () => {
    it('debe retornar true para contraseña correcta', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      const result = await service.compare(password, hash);
      expect(result).toBe(true);
    });

    it('debe retornar false para contraseña incorrecta', async () => {
      const password = 'TestPassword123!';
      const hash = await service.hash(password);

      const result = await service.compare('WrongPassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('validate', () => {
    it('debe validar contraseña contra política completa', () => {
      const policy = new PasswordPolicy(
        8,
        128,
        true, // requiere mayúscula
        true, // requiere minúscula
        true, // requiere número
        true, // requiere especial
        90,
        5,
      );

      const validPassword = 'TestPassword123!';
      const result = service.validate(validPassword, policy);

      expect(result.isValid).toBe(true);
      expect(result.hasErrors()).toBe(false);
    });

    it('debe rechazar contraseña muy corta', () => {
      const policy = new PasswordPolicy(8, 128, true, true, true, true, 90, 5);
      const shortPassword = 'Short1!';

      const result = service.validate(shortPassword, policy);

      expect(result.isValid).toBe(false);
      expect(result.hasErrors()).toBe(true);
    });

    it('debe rechazar contraseña sin mayúscula', () => {
      const policy = new PasswordPolicy(8, 128, true, true, true, true, 90, 5);
      const noUpperPassword = 'testpassword123!';

      const result = service.validate(noUpperPassword, policy);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos una mayúscula',
      );
    });

    it('debe rechazar contraseña sin minúscula', () => {
      const policy = new PasswordPolicy(8, 128, true, true, true, true, 90, 5);
      const noLowerPassword = 'TESTPASSWORD123!';

      const result = service.validate(noLowerPassword, policy);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos una minúscula',
      );
    });

    it('debe rechazar contraseña sin número', () => {
      const policy = new PasswordPolicy(8, 128, true, true, true, true, 90, 5);
      const noNumberPassword = 'TestPassword!';

      const result = service.validate(noNumberPassword, policy);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('La contraseña debe contener al menos un número');
    });

    it('debe rechazar contraseña sin carácter especial', () => {
      const policy = new PasswordPolicy(8, 128, true, true, true, true, 90, 5);
      const noSpecialPassword = 'TestPassword123';

      const result = service.validate(noSpecialPassword, policy);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'La contraseña debe contener al menos un carácter especial',
      );
    });
  });

  describe('generateResetToken', () => {
    it('debe generar un token seguro', () => {
      const token1 = service.generateResetToken();
      const token2 = service.generateResetToken();

      expect(token1).toBeDefined();
      expect(token1.length).toBeGreaterThan(32);
      expect(token1).not.toBe(token2);
    });
  });
});

