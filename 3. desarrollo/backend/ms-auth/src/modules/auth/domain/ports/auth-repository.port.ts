import { UsuarioEntity } from '../entities/usuario.entity';

/**
 * Puerto (interfaz) para el repositorio de autenticación
 */
export interface IAuthRepository {
  findByUsername(username: string): Promise<UsuarioEntity | null>;
  findById(id: number): Promise<UsuarioEntity | null>;
  findByEmail(email: string): Promise<UsuarioEntity | null>;
  findByUuid(uuid: string): Promise<UsuarioEntity | null>;
  updateLastLogin(id: number, ip: string): Promise<void>;
  incrementFailedAttempts(id: number): Promise<number>;
  resetFailedAttempts(id: number): Promise<void>;
  lockUser(id: number, until: Date, reason: string): Promise<void>;
  unlockUser(id: number): Promise<void>;
  updatePassword(id: number, passwordHash: string): Promise<void>;
  getPasswordHistory(userId: number, limit: number): Promise<string[]>;
  savePasswordHistory(userId: number, passwordHash: string): Promise<void>;
}

/**
 * Token para inyección de dependencias
 */
export const AUTH_REPOSITORY = Symbol('AUTH_REPOSITORY');

