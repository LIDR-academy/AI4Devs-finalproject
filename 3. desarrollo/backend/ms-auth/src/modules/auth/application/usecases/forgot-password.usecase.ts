import { Injectable, Inject } from '@nestjs/common';
import {
  AUTH_REPOSITORY,
  IAuthRepository,
} from '../../domain/ports/auth-repository.port';
import {
  AUDIT_REPOSITORY,
  IAuditRepository,
} from '../../domain/ports/audit-repository.port';
import { PasswordService } from '../../infrastructure/services/password.service';
import { ForgotPasswordRequestDto } from '../../infrastructure/dto/request/forgot-password.request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResetPasswordModel } from '../../infrastructure/models/reset-password.model';

/**
 * Use Case para solicitar recuperación de contraseña
 */
@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
    @InjectRepository(ResetPasswordModel)
    private readonly resetPasswordRepo: Repository<ResetPasswordModel>,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Ejecuta el proceso de solicitud de recuperación
   */
  async execute(
    dto: ForgotPasswordRequestDto,
    clientInfo: { ipAddress: string },
  ): Promise<{ success: boolean; message: string }> {
    // 1. Buscar usuario por email
    const usuario = await this.authRepository.findByEmail(dto.email);

    // 2. Si no existe, retornar éxito (no revelar si el email existe)
    if (!usuario || !usuario.estaActivo()) {
      return {
        success: true,
        message:
          'Si el correo existe en el sistema, recibirá instrucciones para restablecer su contraseña',
      };
    }

    // 3. Generar token de reset
    const resetToken = this.passwordService.generateResetToken();
    const tokenHash = await this.passwordService.hashResetToken(resetToken);

    // 4. Crear registro de reset token (expira en 1 hora)
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 1);

    const resetModel = this.resetPasswordRepo.create({
      tokenHash,
      usuarioId: usuario.id,
      fechaExpiracion,
      ipRequest: clientInfo.ipAddress,
    });

    await this.resetPasswordRepo.save(resetModel);

    // 5. TODO: Enviar email con el token (implementar después)
    // await this.emailService.sendPasswordResetEmail(usuario.email, resetToken);

    // 6. Registrar en auditoría
    await this.auditRepository.log({
      tipoEvento: 'PASSWORD_RESET_REQUEST',
      usuarioId: usuario.id,
      nombreUsuario: usuario.username,
      ipLogin: clientInfo.ipAddress,
      exito: true,
      empresaId: usuario.empresaId,
      oficinaId: usuario.oficinaId,
    });

    return {
      success: true,
      message:
        'Si el correo existe en el sistema, recibirá instrucciones para restablecer su contraseña',
    };
  }
}

