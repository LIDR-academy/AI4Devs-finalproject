import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PasswordPolicy } from '../../domain/value-objects/password-policy.vo';
import { ValidationResult } from '../../domain/value-objects/validation-result.vo';

/**
 * Servicio para gestión de contraseñas
 */
@Injectable()
export class PasswordService {
  private readonly BCRYPT_ROUNDS = 12;

  /**
   * Genera un hash de contraseña usando bcrypt
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Compara una contraseña en texto plano con un hash
   */
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Valida una contraseña contra una política
   */
  validate(password: string, policy: PasswordPolicy): ValidationResult {
    return policy.validate(password);
  }

  /**
   * Genera un token seguro para reset de contraseña
   */
  generateResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Genera un hash para el token de reset (para almacenamiento seguro)
   */
  async hashResetToken(token: string): Promise<string> {
    return this.hash(token);
  }
}

