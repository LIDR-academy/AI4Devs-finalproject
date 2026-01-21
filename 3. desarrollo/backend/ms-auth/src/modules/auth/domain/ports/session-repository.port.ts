import { SesionEntity } from '../entities/sesion.entity';

/**
 * Datos para crear una nueva sesión
 */
export interface CreateSessionData {
  usuarioId: number;
  refreshTokenHash: string;
  tokenFamily: string;
  ipLogin: string;
  userAgent: string | null;
  deviceFingerprint: string | null;
  deviceName: string | null;
  fechaExpiracion: Date;
}

/**
 * Puerto (interfaz) para el repositorio de sesiones
 */
export interface ISessionRepository {
  create(session: CreateSessionData): Promise<SesionEntity>;
  findByRefreshTokenHash(hash: string): Promise<SesionEntity | null>;
  findByUuid(uuid: string): Promise<SesionEntity | null>;
  findActiveByUserId(userId: number): Promise<SesionEntity[]>;
  updateActivity(sessionId: number): Promise<void>;
  updateRefreshToken(
    sessionId: number,
    newHash: string,
    newFamily: string,
  ): Promise<void>;
  revoke(
    sessionId: number,
    reason: string,
    revokedBy?: number,
  ): Promise<void>;
  revokeAllByUserId(
    userId: number,
    reason: string,
    exceptSessionId?: number,
  ): Promise<number>;
}

/**
 * Token para inyección de dependencias
 */
export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

