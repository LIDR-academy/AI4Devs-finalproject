import { UserEntity, OfficeEntity, SessionEntity } from '../../../domain/entities';

/**
 * DTO para respuesta de login
 */
export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: UserDto;
  requirePasswordChange?: boolean;
  schedule?: ScheduleInfoDto;
  activeSession?: ActiveSessionDto;
}

/**
 * DTO para información de usuario
 */
export interface UserDto {
  id: number;
  uuid: string;
  username: string;
  nombreCompleto: string;
  email: string | null;
  empresaId: number;
  oficinaId: number | null;
  perfilId: number;
  tipoUsuario: 'EMPLEADO' | 'EXTERNO' | 'SISTEMA';
  esAdmin: boolean;
  accesoGlobal: boolean;
  requiereCambioPassword: boolean;
  oficinasPermitidas?: OfficeDto[];
}

/**
 * DTO para información de oficina
 */
export interface OfficeDto {
  id: number;
  codigo: string;
  nombre: string;
  direccion: string;
  activo: boolean;
}

/**
 * DTO para información de horario
 */
export interface ScheduleInfoDto {
  inicio: string;
  fin: string;
  mensaje: string;
}

/**
 * DTO para sesión activa
 */
export interface ActiveSessionDto {
  id: string;
  device: string;
  ip: string;
  lastActivity: string | Date;
}

