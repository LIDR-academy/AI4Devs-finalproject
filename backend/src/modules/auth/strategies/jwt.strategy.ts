import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 
        configService.get<string>('auth.jwt.secret') || 
        configService.get<string>('JWT_SECRET') || 
        'change-this-secret-in-production-use-strong-secret-min-32-chars',
    });
  }

  async validate(payload: JwtPayload) {
    console.log('[JwtStrategy] Validando payload:', { 
      sub: payload.sub, 
      email: payload.email, 
      roles: payload.roles 
    });
    
    if (!payload.sub || !payload.email) {
      console.error('[JwtStrategy] Payload inválido - falta sub o email');
      throw new UnauthorizedException('Token inválido: falta información del usuario');
    }

    const user = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
    };
    
    console.log('[JwtStrategy] Usuario validado:', user);
    return user;
  }
}
