import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Permitir rutas públicas si están marcadas con @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Log para debugging
    if (err || !user) {
      if (err) {
        console.error('[JwtAuthGuard] Error:', err.message || err);
      }
      
      if (info) {
        console.error('[JwtAuthGuard] Info:', info.message || info.name || info);
      }
      
      if (info?.message === 'No auth token' || info?.name === 'UnauthorizedError') {
        throw new UnauthorizedException('Token no proporcionado. Usa el botón "Authorize" en Swagger y pega el token.');
      }
      
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado. Haz login de nuevo.');
      }
      
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(`Token inválido: ${info.message || 'Token mal formateado'}`);
      }
      
      throw err || new UnauthorizedException(`Token inválido o expirado: ${info?.message || 'Token no válido'}`);
    }
    
    console.log('[JwtAuthGuard] Usuario autenticado:', { userId: user?.userId, email: user?.email });
    return user;
  }
}
