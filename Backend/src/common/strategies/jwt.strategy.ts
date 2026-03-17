import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../interfaces/authenticated-request.interface';

/**
 * Interfaz que define la estructura del payload JWT.
 *
 * El campo `sub` (subject) contiene el identificador del usuario y puede ser
 * string o number según el estándar JWT. En este sistema siempre será string (UUID).
 * El campo `email` contiene el email del usuario autenticado.
 */
export interface JwtPayload {
  sub: string | number;
  email: string;
  [key: string]: any;
}

/**
 * Estrategia JWT de Passport para validar tokens JWT.
 *
 * Esta estrategia:
 * 1. Extrae el token JWT del header Authorization (Bearer token)
 * 2. Valida y decodifica el token usando el secret configurado
 * 3. Retorna el payload del token que será asignado a req.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtSecret = configService.get<string>('jwt.secret');

    if (!jwtSecret || jwtSecret.trim() === '') {
      throw new Error(
        'JWT_SECRET no está configurado. Por favor, configure la variable de entorno JWT_SECRET antes de iniciar la aplicación.',
      );
    }

    super({
      // Extrae el token del header Authorization como "Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Indica si el secret debe ser verificado en cada request
      ignoreExpiration: false,
      // Secret usado para verificar la firma del token
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Valida el payload del token JWT.
   * Este método se ejecuta automáticamente después de que Passport valida el token.
   *
   * @param payload - Payload decodificado del token JWT
   * @returns Usuario autenticado que será asignado a req.user
   * @throws UnauthorizedException si el payload es inválido
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    // Validar que el payload tenga los campos mínimos requeridos
    // Validar sub: puede ser string o number, pero no puede ser undefined, null o vacío
    if (
      payload.sub === undefined ||
      payload.sub === null ||
      (typeof payload.sub === 'string' && payload.sub.trim() === '')
    ) {
      throw new UnauthorizedException(
        'Token inválido: campo sub faltante o inválido',
      );
    }

    // Validar email: debe ser string no vacío
    if (
      !payload.email ||
      typeof payload.email !== 'string' ||
      payload.email.trim() === ''
    ) {
      throw new UnauthorizedException(
        'Token inválido: campo email inválido o faltante',
      );
    }

    // Convertir sub a string si es number (aunque en este sistema siempre será string/UUID)
    const userId =
      typeof payload.sub === 'number' ? String(payload.sub) : payload.sub;

    // Retornar el usuario autenticado
    // El payload del token debe contener: { sub: user.id, email: user.email }
    return {
      id: userId,
      email: payload.email,
    };
  }
}
