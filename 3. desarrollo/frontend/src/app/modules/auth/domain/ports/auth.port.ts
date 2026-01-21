import { Observable } from 'rxjs';
import { UserEntity, OfficeEntity, SessionEntity } from '../entities';
import { LoginCredentials } from '../value-objects';

/**
 * Respuesta de login exitoso
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: UserEntity;
  requirePasswordChange?: boolean;
  schedule?: ScheduleInfo;
  activeSession?: ActiveSession;
}

/**
 * Información de horario permitido
 */
export interface ScheduleInfo {
  inicio: string;
  fin: string;
  mensaje: string;
}

/**
 * Sesión activa detectada
 */
export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  lastActivity: Date;
}

/**
 * Respuesta de token refresh
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Port para operaciones de autenticación
 * Define el contrato que debe cumplir cualquier adaptador de autenticación
 */
export interface IAuthPort {
  /**
   * Inicia sesión con credenciales
   */
  login(credentials: LoginCredentials): Observable<LoginResponse>;

  /**
   * Cierra la sesión actual
   */
  logout(): Observable<void>;

  /**
   * Refresca el token de acceso
   */
  refreshToken(): Observable<TokenResponse>;

  /**
   * Solicita recuperación de contraseña
   */
  forgotPassword(email: string): Observable<void>;

  /**
   * Restablece la contraseña con token
   */
  resetPassword(token: string, password: string): Observable<void>;

  /**
   * Cambia la contraseña del usuario autenticado
   */
  changePassword(current: string, newPassword: string): Observable<void>;

  /**
   * Fuerza login cerrando otras sesiones
   */
  forceLogin(credentials: LoginCredentials): Observable<LoginResponse>;

  /**
   * Obtiene las sesiones activas del usuario
   */
  getActiveSessions(): Observable<SessionEntity[]>;

  /**
   * Selecciona una oficina para la sesión actual
   */
  selectOffice(officeId: number): Observable<void>;
}

