import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service';
import { RefreshTokenRequestDto } from '../../infrastructure/dto/request/refresh-token.request.dto';
import { LoginResponseDto, UserInfoDto } from '../../infrastructure/dto/response/login.response.dto';
import { PerfilMapper } from '../../infrastructure/mappers/perfil.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilModel } from '../../infrastructure/models/perfil.model';
import * as crypto from 'crypto';

/**
 * Use Case para refrescar tokens de acceso
 */
@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
    @InjectRepository(PerfilModel)
    private readonly perfilRepo: Repository<PerfilModel>,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  /**
   * Ejecuta el proceso de refresh token
   */
  async execute(dto: RefreshTokenRequestDto): Promise<LoginResponseDto> {
    // 1. Verificar y decodificar el refresh token
    let payload;
    try {
      payload = this.jwtTokenService.verifyRefreshToken(dto.refreshToken);
    } catch (error) {
      await this.auditRepository.log({
        tipoEvento: 'TOKEN_REFRESH_FAILED',
        ipLogin: 'unknown',
        exito: false,
        motivoError: 'Token inválido o expirado',
      });
      throw new UnauthorizedException('Token de refresco inválido');
    }

    // 2. Hashear el token para buscar la sesión
    const tokenHash = this.jwtTokenService.hashRefreshToken(dto.refreshToken);

    // 3. Buscar sesión por hash
    const sesion = await this.sessionRepository.findByRefreshTokenHash(
      tokenHash,
    );

    if (!sesion) {
      await this.auditRepository.log({
        tipoEvento: 'TOKEN_REFRESH_FAILED',
        usuarioId: payload.sub,
        ipLogin: 'unknown',
        exito: false,
        motivoError: 'Sesión no encontrada',
      });
      throw new UnauthorizedException('Sesión no encontrada');
    }

    // 4. Verificar que la sesión esté activa
    if (!sesion.estaActiva()) {
      await this.auditRepository.log({
        tipoEvento: 'TOKEN_REFRESH_FAILED',
        usuarioId: payload.sub,
        sesionUuid: sesion.uuid,
        ipLogin: 'unknown',
        exito: false,
        motivoError: 'Sesión inactiva o revocada',
      });
      throw new UnauthorizedException('La sesión ha sido revocada');
    }

    // 5. Verificar token family (detección de reuse)
    if (sesion.tokenFamily !== payload.family) {
      // Posible robo de token - revocar todas las sesiones del usuario
      await this.sessionRepository.revokeAllByUserId(
        payload.sub,
        'TOKEN_REUSE',
      );

      await this.auditRepository.log({
        tipoEvento: 'TOKEN_REUSE_DETECTED',
        usuarioId: payload.sub,
        sesionUuid: sesion.uuid,
        ipLogin: 'unknown',
        exito: false,
        motivoError: 'Token family no coincide - posible reutilización',
      });

      throw new UnauthorizedException(
        'Sesión inválida. Por seguridad, inicie sesión nuevamente.',
      );
    }

    // 6. Verificar que el usuario siga activo
    const usuario = await this.authRepository.findById(payload.sub);
    if (!usuario || !usuario.estaActivo()) {
      await this.sessionRepository.revoke(sesion.id, 'EXPIRED');
      throw new UnauthorizedException('Usuario inactivo');
    }

    // 7. Obtener perfil para configuración de tokens
    const perfilModel = await this.perfilRepo.findOne({
      where: { id: usuario.perfilId },
    });

    if (!perfilModel) {
      throw new UnauthorizedException('Perfil de usuario no encontrado');
    }

    const perfil = PerfilMapper.toDomain(perfilModel);
    const tokenConfig = perfil.getTokenConfig();

    // 8. Generar nuevos tokens
    const newTokenFamily = crypto.randomUUID();
    const newRefreshToken = this.jwtTokenService.generateRefreshToken(
      usuario,
      sesion.uuid,
      tokenConfig,
      newTokenFamily,
    );
    const newRefreshTokenHash =
      this.jwtTokenService.hashRefreshToken(newRefreshToken);
    const newAccessToken = this.jwtTokenService.generateAccessToken(
      usuario,
      tokenConfig,
    );

    // 9. Actualizar sesión con nuevo token
    await this.sessionRepository.updateRefreshToken(
      sesion.id,
      newRefreshTokenHash,
      newTokenFamily,
    );

    // 10. Registrar éxito en auditoría
    await this.auditRepository.log({
      tipoEvento: 'TOKEN_REFRESH',
      usuarioId: usuario.id,
      sesionUuid: sesion.uuid,
      ipLogin: 'unknown',
      exito: true,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
    });

    // 11. Preparar respuesta
    const expiresIn = Math.floor(
      (tokenConfig.getAccessTokenExpiration().getTime() - Date.now()) / 1000,
    );

    const userInfo: UserInfoDto = {
      id: usuario.id,
      uuid: usuario.uuid,
      username: usuario.username,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email || undefined,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
      perfilId: usuario.perfilId,
    };

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      tokenType: 'Bearer',
      user: userInfo,
    };
  }
}

