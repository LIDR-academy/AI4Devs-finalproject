import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

/**
 * Guard para autenticación JWT
 * Extiende AuthGuard de Passport y maneja tokens expirados
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Permitir endpoints públicos si están marcados
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Puedes lanzar una excepción basada en "info" o "err"
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('El token ha expirado');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token de acceso inválido');
      }
      throw err || new UnauthorizedException('No autorizado');
    }
    return user;
  }
}

