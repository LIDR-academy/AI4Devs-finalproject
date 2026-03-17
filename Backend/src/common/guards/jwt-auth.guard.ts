import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT de autenticación.
 *
 * Este guard:
 * 1. Activa la estrategia JWT de Passport
 * 2. Valida el token JWT del header Authorization
 * 3. Asigna el usuario autenticado a req.user
 * 4. Lanza UnauthorizedException si el token es inválido o está ausente
 *
 * Uso:
 * @UseGuards(JwtAuthGuard)
 * async someMethod() { ... }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
