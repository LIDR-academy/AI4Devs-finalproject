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
import { ResetPasswordRequestDto } from '../../infrastructure/dto/request/reset-password.request.dto';
import { PerfilMapper } from '../../infrastructure/mappers/perfil.mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResetPasswordModel } from '../../infrastructure/models/reset-password.model';
import { PerfilModel } from '../../infrastructure/models/perfil.model';

/**
 * Use Case para reset de contraseña
 */
@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
    @InjectRepository(ResetPasswordModel)
    private readonly resetPasswordRepo: Repository<ResetPasswordModel>,
    @InjectRepository(PerfilModel)
    private readonly perfilRepo: Repository<PerfilModel>,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Ejecuta el proceso de reset de contraseña
   */
  async execute(dto: ResetPasswordRequestDto): Promise<void> {
    // 1. Validar que las contraseñas coincidan
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden');
    }

    // 2. Hashear el token proporcionado
    const tokenHash = await this.passwordService.hashResetToken(dto.token);

    // 3. Buscar token de reset
    const resetToken = await this.resetPasswordRepo.findOne({
      where: { tokenHash },
      relations: ['usuario'],
    });

    if (!resetToken) {
      throw new UnauthorizedException(
        'El enlace de recuperación es inválido o ha expirado',
      );
    }

    // 4. Verificar que el token no haya sido usado
    if (resetToken.usado) {
      throw new UnauthorizedException(
        'El enlace de recuperación ya ha sido utilizado',
      );
    }

    // 5. Verificar que el token no haya expirado
    if (new Date() > resetToken.fechaExpiracion) {
      await this.resetPasswordRepo.update(resetToken.id, {
        usado: true,
        fechaUso: new Date(),
      });
      throw new UnauthorizedException(
        'El enlace de recuperación ha expirado',
      );
    }

    // 6. Obtener usuario
    const usuario = await this.authRepository.findById(resetToken.usuarioId);
    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // 7. Obtener perfil para validar política
    const perfilModel = await this.perfilRepo.findOne({
      where: { id: usuario.perfilId },
    });

    if (!perfilModel) {
      throw new UnauthorizedException('Perfil de usuario no encontrado');
    }

    const perfil = PerfilMapper.toDomain(perfilModel);
    const passwordPolicy = perfil.getPasswordPolicy();

    // 8. Validar nueva contraseña contra política
    const validation = this.passwordService.validate(
      dto.newPassword,
      passwordPolicy,
    );

    if (!validation.isValid) {
      throw new BadRequestException(
        validation.getFirstError() || 'La contraseña no cumple con la política',
      );
    }

    // 9. Verificar historial de contraseñas
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
        throw new BadRequestException(
          `No puede reutilizar una de sus últimas ${passwordPolicy.historyCount} contraseñas`,
        );
      }
    }

    // 10. Guardar contraseña actual en historial
    await this.authRepository.savePasswordHistory(
      usuario.id,
      usuario.passwordHash,
    );

    // 11. Hashear nueva contraseña
    const newPasswordHash = await this.passwordService.hash(dto.newPassword);

    // 12. Actualizar contraseña
    await this.authRepository.updatePassword(usuario.id, newPasswordHash);

    // 13. Marcar token como usado
    await this.resetPasswordRepo.update(resetToken.id, {
      usado: true,
      fechaUso: new Date(),
    });

    // 14. Revocar todas las sesiones del usuario
    await this.sessionRepository.revokeAllByUserId(
      usuario.id,
      'PASSWORD_CHANGE',
    );

    // 15. Registrar éxito en auditoría
    await this.auditRepository.log({
      tipoEvento: 'PASSWORD_RESET_COMPLETE',
      usuarioId: usuario.id,
      nombreUsuario: usuario.username,
      ipLogin: resetToken.ipRequest,
      exito: true,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
    });
  }
}

