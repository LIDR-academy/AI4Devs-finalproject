import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from '../../../../common/config';
import { RefreshTokenPayload } from '../services/jwt-token.service';

/**
 * Estrategia de Passport para validar refresh tokens JWT
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: envs.jwt.secret,
    });
  }

  /**
   * Valida el payload del refresh token
   */
  async validate(payload: RefreshTokenPayload): Promise<RefreshTokenPayload> {
    if (!payload.sub || !payload.sessionId || !payload.family) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    return payload;
  }
}

