import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { envs } from '../../../../common/config';
import { TokenPayload } from '../services/jwt-token.service';

/**
 * Estrategia de Passport para validar access tokens JWT
 */
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envs.jwt.secret,
    });
  }

  /**
   * Valida el payload del token
   */
  async validate(payload: TokenPayload): Promise<TokenPayload> {
    if (!payload.sub || !payload.uuid) {
      throw new UnauthorizedException('Token inválido');
    }

    return payload;
  }
}

