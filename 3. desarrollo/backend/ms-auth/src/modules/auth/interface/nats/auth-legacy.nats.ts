import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { RefreshTokenUseCase } from '../../application/usecases/refresh-token.usecase';
import { LogoutUseCase } from '../../application/usecases/logout.usecase';
import { GetProfileUseCase } from '../../application/usecases/get-profile.usecase';
import { JwtTokenService, TokenPayload } from '../../infrastructure/services/jwt-token.service';
import { LoginRequestDto } from '../../infrastructure/dto/request/login.request.dto';
import { RefreshTokenRequestDto } from '../../infrastructure/dto/request/refresh-token.request.dto';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/ports/auth-repository.port';
import { SESSION_REPOSITORY, ISessionRepository } from '../../domain/ports/session-repository.port';
import { PerfilMapper } from '../../infrastructure/mappers/perfil.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilModel } from '../../infrastructure/models/perfil.model';
import * as crypto from 'crypto';

/**
 * Controlador NATS legacy para compatibilidad con MS-CORE
 * Maneja los patrones de mensaje antiguos: { sm: 'signInAuth' }
 */
@Controller()
export class AuthLegacyNatsController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly jwtTokenService: JwtTokenService,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @InjectRepository(PerfilModel)
    private readonly perfilRepo: Repository<PerfilModel>,
  ) {}

  /**
   * Inicia sesión
   * Pattern: { sm: 'signInAuth' }
   */
  @MessagePattern({ sm: 'signInAuth' })
  async signIn(@Payload() dto: LoginRequestDto) {
    // Extraer información del cliente (básica para NATS)
    const clientInfo = {
      ipAddress: '127.0.0.1', // IP local para requests desde NATS
      userAgent: 'NATS',
      deviceFingerprint: undefined,
    };

    const result = await this.loginUseCase.execute(dto, clientInfo);

    // Transformar respuesta al formato esperado por MS-CORE
    return {
      data: {
        user: {
          id: result.user.id,
          uuid: result.user.uuid,
          username: result.user.username,
          nombreCompleto: result.user.nombreCompleto,
          email: result.user.email,
          empresaId: result.user.empresaId,
          oficinaId: result.user.oficinaId,
          perfilId: result.user.perfilId,
        },
        token: {
          access: result.accessToken,
          refresh: result.refreshToken,
        },
      },
      meta: {
        information: {
          type: 'success',
          action: 'login',
          message: 'Sesión iniciada exitosamente',
          resource: 'auth',
          method: 'signIn',
        },
        pagination: null,
        status: 200,
        error: null,
      },
    };
  }

  /**
   * Verifica un token y retorna información del usuario
   * Pattern: { sm: 'verifyTokenAuth' }
   */
  @MessagePattern({ sm: 'verifyTokenAuth' })
  async verifyToken(@Payload() data: { token: string }) {
    try {
      // Verificar el token
      const payload = this.jwtTokenService.verifyAccessToken(data.token);

      // Obtener usuario
      const usuario = await this.authRepository.findById(payload.sub);
      if (!usuario || !usuario.estaActivo()) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Obtener perfil para configuración de tokens
      const perfilModel = await this.perfilRepo.findOne({
        where: { id: usuario.perfilId },
      });
      if (!perfilModel) {
        throw new Error('Perfil no encontrado');
      }

      const perfil = PerfilMapper.toDomain(perfilModel);
      const tokenConfig = perfil.getTokenConfig();

      // Buscar sesión activa
      const sesiones = await this.sessionRepository.findActiveByUserId(usuario.id);
      const sesion = sesiones[0];

      let newRefreshToken: string | null = null;
      let newAccessToken: string;

      if (sesion) {
        // Generar nuevos tokens
        const newTokenFamily = crypto.randomUUID();
        newRefreshToken = this.jwtTokenService.generateRefreshToken(
          usuario,
          sesion.uuid,
          tokenConfig,
          newTokenFamily,
        );
        newAccessToken = this.jwtTokenService.generateAccessToken(usuario, tokenConfig);

        // Actualizar sesión
        const newRefreshTokenHash = this.jwtTokenService.hashRefreshToken(newRefreshToken);
        await this.sessionRepository.updateRefreshToken(
          sesion.id,
          newRefreshTokenHash,
          newTokenFamily,
        );
      } else {
        // Si no hay sesión, solo generar access token
        newAccessToken = this.jwtTokenService.generateAccessToken(usuario, tokenConfig);
      }

      return {
        data: {
          user: {
            id: usuario.id,
            uuid: usuario.uuid,
            username: usuario.username,
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            empresaId: usuario.empresaId,
            oficinaId: usuario.oficinaId,
            perfilId: usuario.perfilId,
          },
          token: {
            access: newAccessToken,
            refresh: newRefreshToken || undefined,
          },
        },
        meta: {
          information: {
            type: 'success',
            action: 'verify',
            message: 'Token verificado exitosamente',
            resource: 'auth',
            method: 'verifyToken',
          },
          pagination: null,
          status: 200,
          error: null,
        },
      };
    } catch (error: any) {
      throw {
        message: error.message || 'Token inválido',
        status: 401,
      };
    }
  }

  /**
   * Refresca un token
   * Pattern: { sm: 'refreshTokenAuth' }
   */
  @MessagePattern({ sm: 'refreshTokenAuth' })
  async refreshToken(@Payload() data: { token: string }) {
    const refreshDto: RefreshTokenRequestDto = {
      refreshToken: data.token,
    };

    const result = await this.refreshTokenUseCase.execute(refreshDto);

    return {
      data: {
        user: {
          id: result.user.id,
          uuid: result.user.uuid,
          username: result.user.username,
          nombreCompleto: result.user.nombreCompleto,
          email: result.user.email,
          empresaId: result.user.empresaId,
          oficinaId: result.user.oficinaId,
          perfilId: result.user.perfilId,
        },
        token: {
          access: result.accessToken,
          refresh: result.refreshToken,
        },
      },
      meta: {
        information: {
          type: 'success',
          action: 'refresh',
          message: 'Token refrescado exitosamente',
          resource: 'auth',
          method: 'refreshToken',
        },
        pagination: null,
        status: 200,
        error: null,
      },
    };
  }

  /**
   * Cierra sesión
   * Pattern: { sm: 'signOutAuth' }
   */
  @MessagePattern({ sm: 'signOutAuth' })
  async signOut(@Payload() id: number) {
    // Obtener usuario para extraer información del token
    const usuario = await this.authRepository.findById(id);
    if (!usuario) {
      throw {
        message: 'Usuario no encontrado',
        status: 404,
      };
    }

    // Crear payload básico para logout
    const tokenPayload: TokenPayload & { sessionUuid?: string } = {
      sub: usuario.id,
      uuid: usuario.uuid,
      username: usuario.username,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
      perfilId: usuario.perfilId,
      tipoUsuario: usuario.tipoUsuario,
    };

    await this.logoutUseCase.execute(tokenPayload);

    return {
      data: {
        id: usuario.id,
        uuid: usuario.uuid,
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
      },
      meta: {
        information: {
          type: 'success',
          action: 'logout',
          message: 'Sesión cerrada exitosamente',
          resource: 'auth',
          method: 'signOut',
        },
        pagination: null,
        status: 200,
        error: null,
      },
    };
  }

  /**
   * Obtiene información de un usuario
   * Pattern: { sm: 'findUserInfoAuth' }
   */
  @MessagePattern({ sm: 'findUserInfoAuth' })
  async findUserInfo(@Payload() data: { id: number }) {
    const usuario = await this.authRepository.findById(data.id);

    if (!usuario) {
      throw {
        message: 'Usuario no encontrado',
        status: 404,
      };
    }

    return {
      data: {
        id: usuario.id,
        uuid: usuario.uuid,
        username: usuario.username,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        empresaId: usuario.empresaId,
        oficinaId: usuario.oficinaId,
        perfilId: usuario.perfilId,
        tipoUsuario: usuario.tipoUsuario,
        esAdmin: usuario.esAdmin,
        activo: usuario.activo,
      },
      meta: {
        information: {
          type: 'success',
          action: 'find',
          message: 'Información de usuario obtenida exitosamente',
          resource: 'auth',
          method: 'findUserInfo',
        },
        pagination: null,
        status: 200,
        error: null,
      },
    };
  }
}

