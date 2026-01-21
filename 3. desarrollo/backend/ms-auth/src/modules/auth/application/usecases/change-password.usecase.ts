import { Injectable, Inject, BadRequestException, UnauthorizedException } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  SESSION_REPOSITORY,
  ISessionRepository,
} from '../../domain/ports/session-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { PasswordService } from '../../infrastructure/services/password.service';
import { ChangePasswordRequestDto } from '../../infrastructure/dto/request/change-password.request.dto';
import { TokenPayload } from '../../infrastructure/services/jwt-token.service';
import { PerfilMapper } from '../../infrastructure/mappers/perfil.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilModel } from '../../infrastructure/models/perfil.model';

/**
 * Use Case para cambio de contraseña
 */
@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
    @InjectRepository(PerfilModel)
    private readonly perfilRepo: Repository<PerfilModel>,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Ejecuta el proceso de cambio de contraseña
   */
  async execute(
    dto: ChangePasswordRequestDto,
    user: TokenPayload,
  ): Promise<void> {
    // 1. Validar que las contraseñas coincidan
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 2. Obtener usuario
    const usuario = await this.authRepository.findById(user.sub);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 3. Verificar contraseña actual
    const currentPasswordValid = await this.passwordService.compare(
      dto.currentPassword,
      usuario.passwordHash,
    );

    if (!currentPasswordValid) {
      await this.auditRepository.log({
        tipoEvento: 'PASSWORD_CHANGE_FAILED',
        usuarioId: user.sub,
        ipLogin: 'unknown',
        exito: false,
        motivoError: 'Contraseña actual incorrecta',
        empresaId: user.empresaId,
        oficinaId: user.oficinaId,
      });
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // 4. Obtener perfil para validar política
    const perfilModel = await this.perfilRepo.findOne({
      where: { id: usuario.perfilId },
    });

    if (!perfilModel) {
      throw new UnauthorizedException('Perfil de usuario no encontrado');
    }

    const perfil = PerfilMapper.toDomain(perfilModel);
    const passwordPolicy = perfil.getPasswordPolicy();

    // 5. Validar nueva contraseña contra política
    const validation = this.passwordService.validate(
      dto.newPassword,
      passwordPolicy,
    );

    if (!validation.isValid) {
      await this.auditRepository.log({
        tipoEvento: 'PASSWORD_CHANGE_FAILED',
        usuarioId: user.sub,
        ipLogin: 'unknown',
        exito: false,
        motivoError: validation.getFirstError() || 'Política de contraseña no cumplida',
        empresaId: user.empresaId,
        oficinaId: user.oficinaId,
      });
      throw new BadRequestException(
        validation.getFirstError() || 'La contraseña no cumple con la política',
      );
    }

    // 6. Verificar historial de contraseñas
    const passwordHistory = await this.authRepository.getPasswordHistory(
      usuario.id,
      passwordPolicy.historyCount,
    );

    for (const oldHash of passwordHistory) {
      const isReused = await this.passwordService.compare(
        dto.newPassword,
        oldHash,
      );
      if (isReused) {
        await this.auditRepository.log({
          tipoEvento: 'PASSWORD_CHANGE_FAILED',
          usuarioId: user.sub,
          ipLogin: 'unknown',
          exito: false,
          motivoError: `No puede reutilizar una de sus últimas ${passwordPolicy.historyCount} contraseñas`,
          empresaId: user.empresaId,
          oficinaId: user.oficinaId,
        });
        throw new BadRequestException(
          `No puede reutilizar una de sus últimas ${passwordPolicy.historyCount} contraseñas`,
        );
      }
    }

    // 7. Guardar contraseña actual en historial
    await this.authRepository.savePasswordHistory(
      usuario.id,
      usuario.passwordHash,
    );

    // 8. Hashear nueva contraseña
    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    // 9. Actualizar contraseña
    await this.authRepository.updatePassword(usuario.id, newPasswordHash);

    // 10. Revocar todas las sesiones excepto la actual (si existe)
    let currentSession: { id: number } | null = null;
    if ((user as any).sessionUuid) {
      const session = await this.sessionRepository.findByUuid(
        (user as any).sessionUuid,
      );
      if (session) {
        currentSession = { id: session.id };
      }
    }
    await this.sessionRepository.revokeAllByUserId(
      usuario.id,
      'PASSWORD_CHANGE',
      currentSession?.id,
    );

    // 11. Registrar éxito en auditoría
    await this.auditRepository.log({
      tipoEvento: 'PASSWORD_CHANGE',
      usuarioId: user.sub,
      ipLogin: 'unknown',
      exito: true,
      empresaId: user.empresaId,
      oficinaId: user.oficinaId,
    });
  }
}

