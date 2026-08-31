import crypto from 'crypto';
import { IUserRepository } from '../../../domain/auth/repositories/IUserRepository.js';
import { IEmailService } from '../../../domain/auth/ports/IEmailService.js';

export interface RequestAdminPinResetDTO {
  email: string;
  clientOrigin?: string;
}

export interface RequestAdminPinResetResponseDTO {
  message: string;
}

export class RequestAdminPinResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService
  ) {}

  public async execute(dto: RequestAdminPinResetDTO): Promise<RequestAdminPinResetResponseDTO> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(normalizedEmail);

    // Solo se permite reseteo por email a usuarios con rol ADMIN
    if (user && user.role === 'ADMIN') {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos exactos

      user.setResetToken(tokenHash, expiresAt);
      await this.userRepository.save(user);

      const origin = dto.clientOrigin || process.env.CLIENT_ORIGIN || 'http://localhost:8085';
      const resetUrl = `${origin}?resetToken=${rawToken}`;

      await this.emailService.sendPasswordResetEmail({
        to: user.email || normalizedEmail,
        recipientName: user.name,
        resetToken: rawToken,
        resetUrl,
        expiresInMinutes: 15,
      });
    }

    // Respuesta generica constante para mitigar User Enumeration (OWASP Top 10)
    return {
      message: 'Si el correo coincide con un administrador registrado, se enviaron instrucciones de recuperación.',
    };
  }
}
