import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtTokenService, TokenPayload } from '../../infrastructure/services/jwt-token.service';
import { AUTH_REPOSITORY, IAuthRepository } from '../../domain/ports/auth-repository.port';
import { Inject } from '@nestjs/common';
import { UsuarioEntity } from '../../domain/entities/usuario.entity';

/**
 * Payload para validación de token
 */
interface ValidateTokenPayload {
  token: string;
}

/**
 * Respuesta de validación de token
 */
interface ValidateTokenResponse {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
}

/**
 * Payload para obtener usuario
 */
interface GetUserPayload {
  userId?: number;
  uuid?: string;
  username?: string;
}

/**
 * DTO de usuario para NATS
 */
interface UserDto {
  id: number;
  uuid: string;
  username: string;
  nombreCompleto: string;
  email?: string;
  empresaId: number;
  oficinaId: number;
  perfilId: number;
  tipoUsuario: string;
  esAdmin: boolean;
  activo: boolean;
}

/**
 * Payload para verificación de permisos
 */
interface CheckPermissionPayload {
  userId: number;
  permission: string;
  resource?: string;
}

/**
 * Controlador NATS para autenticación
 * Maneja mensajes de otros microservicios
 */
@Controller()
export class AuthNatsController {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
  ) {}

  /**
   * Valida un token JWT
   * Pattern: auth.validate-token
   */
  @MessagePattern('auth.validate-token')
  async validateToken(
    @Payload() data: ValidateTokenPayload,
  ): Promise<ValidateTokenResponse> {
    try {
      const payload = this.jwtTokenService.verifyAccessToken(data.token);
      return {
        valid: true,
        payload,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Token inválido',
      };
    }
  }

  /**
   * Obtiene información de un usuario
   * Pattern: auth.get-user
   */
  @MessagePattern('auth.get-user')
  async getUser(@Payload() data: GetUserPayload): Promise<UserDto | null> {
    let usuario: UsuarioEntity | null = null;

    if (data.userId) {
      usuario = await this.authRepository.findById(data.userId);
    } else if (data.uuid) {
      usuario = await this.authRepository.findByUuid(data.uuid);
    } else if (data.username) {
      usuario = await this.authRepository.findByUsername(data.username);
    }

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      uuid: usuario.uuid,
      username: usuario.username,
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email || undefined,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
      perfilId: usuario.perfilId,
      tipoUsuario: usuario.tipoUsuario,
      esAdmin: usuario.esAdmin,
      activo: usuario.activo,
    };
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * Pattern: auth.check-permission
   * Nota: Implementación básica, se puede extender con sistema de permisos
   */
  @MessagePattern('auth.check-permission')
  async checkPermission(
    @Payload() data: CheckPermissionPayload,
  ): Promise<boolean> {
    const usuario = await this.authRepository.findById(data.userId);

    if (!usuario || !usuario.estaActivo()) {
      return false;
    }

    // TODO: Implementar lógica de permisos basada en perfil
    // Por ahora, solo verificar si es admin
    if (data.permission === 'admin' && usuario.esAdmin) {
      return true;
    }

    // Implementación básica - siempre retorna false
    // Se debe implementar sistema de permisos completo
    return false;
  }
}

