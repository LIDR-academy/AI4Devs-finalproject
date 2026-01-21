import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  SCHEDULE_REPOSITORY,
  IScheduleRepository,
} from '../../domain/ports/schedule-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { PasswordService } from '../../infrastructure/services/password.service';
import { JwtTokenService } from '../../infrastructure/services/jwt-token.service';
import { ScheduleService } from '../../infrastructure/services/schedule.service';
import { LoginRequestDto } from '../../infrastructure/dto/request/login.request.dto';
import { LoginResponseDto, UserInfoDto } from '../../infrastructure/dto/response/login.response.dto';
import { ClientInfo } from '../../infrastructure/interfaces/client-info.interface';
import { PerfilMapper } from '../../infrastructure/mappers/perfil.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilModel } from '../../infrastructure/models/perfil.model';
import * as crypto from 'crypto';

/**
 * Use Case para autenticación de usuarios
 */
@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(SCHEDULE_REPOSITORY)
    private readonly scheduleRepository: IScheduleRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
    @InjectRepository(PerfilModel)
    private readonly perfilRepo: Repository<PerfilModel>,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly scheduleService: ScheduleService,
  ) {}

  /**
   * Ejecuta el proceso de autenticación
   */
  async execute(
    dto: LoginRequestDto,
    clientInfo: ClientInfo,
  ): Promise<LoginResponseDto> {
    // 1. Buscar usuario
    const usuario = await this.authRepository.findByUsername(dto.username);

    // 2. Si no existe, registrar intento fallido y retornar error genérico
    if (!usuario) {
      await this.auditRepository.log({
        tipoEvento: 'LOGIN_FAILED',
        nombreUsuario: dto.username,
        ipLogin: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        exito: false,
        motivoError: 'Usuario no encontrado',
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Verificar si el usuario está activo
    if (!usuario.estaActivo()) {
      await this.auditRepository.log({
        tipoEvento: 'LOGIN_FAILED',
        usuarioId: usuario.id,
        nombreUsuario: dto.username,
        ipLogin: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        exito: false,
        motivoError: 'Usuario inactivo',
        empresaId: usuario.empresaId,
        oficinaId: usuario.oficinaId,
      });
      throw new UnauthorizedException('El usuario se encuentra inactivo');
    }

    // 4. Verificar si el usuario está bloqueado
    if (usuario.estaBloqueado()) {
      await this.auditRepository.log({
        tipoEvento: 'LOGIN_BLOCKED',
        usuarioId: usuario.id,
        nombreUsuario: dto.username,
        ipLogin: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        exito: false,
        motivoError: 'Usuario bloqueado',
        empresaId: usuario.empresaId,
        oficinaId: usuario.oficinaId,
      });

      const minutosRestantes = Math.ceil(
        (usuario.bloqueadoHasta!.getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Usuario bloqueado. Intente nuevamente en ${minutosRestantes} minutos`,
      );
    }

    // 5. Verificar horario (solo si no es usuario SISTEMA)
    if (!usuario.esTipoSistema()) {
      const scheduleCheck = await this.scheduleService.canUserAccessNow(usuario);
      if (!scheduleCheck.allowed) {
        await this.authRepository.incrementFailedAttempts(usuario.id);
        await this.auditRepository.log({
          tipoEvento: 'LOGIN_FUERA_HORARIO',
          usuarioId: usuario.id,
          nombreUsuario: dto.username,
          ipLogin: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
          exito: false,
          motivoError: scheduleCheck.message,
          empresaId: usuario.empresaId,
          oficinaId: usuario.oficinaId,
        });
        throw new UnauthorizedException(scheduleCheck.message);
      }
    }

    // 6. Verificar contraseña
    const passwordValid = await this.passwordService.compare(
      dto.password,
      usuario.passwordHash,
    );

    if (!passwordValid) {
      const intentos = await this.authRepository.incrementFailedAttempts(
        usuario.id,
      );

      // Obtener perfil para verificar política de bloqueo
      const perfilModel = await this.perfilRepo.findOne({
        where: { id: usuario.perfilId },
      });

      if (perfilModel) {
        const perfil = PerfilMapper.toDomain(perfilModel);
        const lockoutPolicy = perfil.getLockoutPolicy();

        // Verificar si debe bloquearse
        if (intentos >= lockoutPolicy.maxAttempts) {
          const bloqueadoHasta = lockoutPolicy.calculateLockoutUntil(
            usuario.fechaPrimerIntentoFallido || new Date(),
          );

          await this.authRepository.lockUser(
            usuario.id,
            bloqueadoHasta || new Date(Date.now() + 30 * 60000), // 30 min por defecto si es permanente
            'Máximo de intentos fallidos alcanzado',
          );

          await this.auditRepository.log({
            tipoEvento: 'ACCOUNT_LOCKED',
            usuarioId: usuario.id,
            nombreUsuario: dto.username,
            ipLogin: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent,
            exito: false,
            motivoError: 'Máximo de intentos fallidos',
            empresaId: usuario.empresaId,
            oficinaId: usuario.oficinaId,
          });
        }
      }

      await this.auditRepository.log({
        tipoEvento: 'LOGIN_FAILED',
        usuarioId: usuario.id,
        nombreUsuario: dto.username,
        ipLogin: clientInfo.ipAddress,
        userAgent: clientInfo.userAgent,
        exito: false,
        motivoError: 'Contraseña incorrecta',
        empresaId: usuario.empresaId,
        oficinaId: usuario.oficinaId,
      });

      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 7. Obtener perfil para verificar políticas
    const perfilModel = await this.perfilRepo.findOne({
      where: { id: usuario.perfilId },
    });

    if (!perfilModel) {
      throw new UnauthorizedException('Perfil de usuario no encontrado');
    }

    const perfil = PerfilMapper.toDomain(perfilModel);
    const tokenConfig = perfil.getTokenConfig();

    // 8. Verificar si la contraseña ha expirado
    const passwordExpired = usuario.debeCambiarPassword(
      perfil.diasVigenciaPassword,
    );

    // 9. Si el perfil requiere sesión única, revocar otras sesiones
    if (perfil.sesionUnica) {
      await this.sessionRepository.revokeAllByUserId(
        usuario.id,
        'NEW_SESSION',
      );
    }

    // 10. Generar tokens
    const sessionUuid = crypto.randomUUID();
    const refreshToken = this.jwtTokenService.generateRefreshToken(
      usuario,
      sessionUuid,
      tokenConfig,
    );
    const refreshTokenHash = this.jwtTokenService.hashRefreshToken(refreshToken);
    const accessToken = this.jwtTokenService.generateAccessToken(
      usuario,
      tokenConfig,
    );

    // 11. Crear sesión
    const fechaExpiracion = tokenConfig.getRefreshTokenExpiration();
    await this.sessionRepository.create({
      usuarioId: usuario.id,
      refreshTokenHash,
      tokenFamily: crypto.randomUUID(),
      ipLogin: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent || null,
      deviceFingerprint: clientInfo.deviceFingerprint || null,
      deviceName: null, // Se puede extraer del user agent
      fechaExpiracion,
    });

    // 12. Actualizar último login
    await this.authRepository.updateLastLogin(
      usuario.id,
      clientInfo.ipAddress,
    );

    // 13. Resetear intentos fallidos
    await this.authRepository.resetFailedAttempts(usuario.id);

    // 14. Registrar éxito en auditoría
    await this.auditRepository.log({
      tipoEvento: 'LOGIN_SUCCESS',
      usuarioId: usuario.id,
      nombreUsuario: dto.username,
      sesionUuid: sessionUuid,
      ipLogin: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      exito: true,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
    });

    // 15. Preparar respuesta
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
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
      user: userInfo,
      requirePasswordChange: passwordExpired,
    };
  }
}

