import { Request } from 'express';

/**
 * Interfaz para el usuario autenticado extraído del JWT.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Interfaz que extiende Express Request para incluir el usuario autenticado.
 * El usuario es agregado por el JwtAuthGuard después de validar el token.
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
