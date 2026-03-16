import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';
import { TokenConfig } from '../../domain/value-objects/token-config.vo';
import { envs } from '../../../../common/config';

/**
 * Payload del access token
 */
export interface TokenPayload {
  sub: number; // usuarioId
  uuid: string; // usuarioUuid
  username: string;
  empresaId: number;
  oficinaId: number;
  perfilId: number;
  tipoUsuario: string;
  iat?: number;
  exp?: number;
}

/**
 * Payload del refresh token
 */
export interface RefreshTokenPayload {
  sub: number; // usuarioId
  sessionId: string; // sesionUuid
  family: string; // tokenFamily
  iat?: number;
  exp?: number;
}

/**
 * Servicio para gestión de tokens JWT
 */
@Injectable()
export class JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Genera un access token para el usuario
   */
  generateAccessToken(
    user: UsuarioEntity,
    tokenConfig: TokenConfig,
  ): string {
    const payload: TokenPayload = {
      sub: user.id,
      uuid: user.uuid,
      username: user.username,
      empresaId: user.empresaId,
      oficinaId: user.oficinaId,
      perfilId: user.perfilId,
      tipoUsuario: user.tipoUsuario,
    };

    const expiration = tokenConfig.getAccessTokenExpiration();
    const expiresIn = Math.floor(
      (expiration.getTime() - Date.now()) / 1000,
    ); // segundos

    return this.jwtService.sign(payload, {
      expiresIn: `${tokenConfig.accessTokenMinutes}m`,
    });
  }

  /**
   * Genera un refresh token para la sesión
   */
  generateRefreshToken(
    user: UsuarioEntity,
    sessionId: string,
    tokenConfig: TokenConfig,
    tokenFamily?: string,
  ): string {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      sessionId,
      family: tokenFamily || crypto.randomUUID(),
    };

    // Usar el mismo secret para refresh tokens (o se puede configurar uno separado)
    const refreshSecret = envs.jwt.secret;

    return this.jwtService.sign(payload, {
      expiresIn: `${tokenConfig.refreshTokenDays}d`,
      secret: refreshSecret,
    });
  }

  /**
   * Verifica y decodifica un access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch (error) {
      throw new UnauthorizedException('Token de acceso inválido');
    }
  }

  /**
   * Verifica y decodifica un refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return this.jwtService.verify<RefreshTokenPayload>(token, {
        secret: envs.jwt.secret,
      });
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  /**
   * Genera un hash del refresh token para almacenamiento seguro
   */
  hashRefreshToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

