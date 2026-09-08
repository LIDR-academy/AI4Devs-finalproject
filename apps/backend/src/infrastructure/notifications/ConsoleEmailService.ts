import { IEmailService, SendPasswordResetEmailDTO } from '../../domain/auth/ports/IEmailService.js';

/**
 * Adaptador de email de desarrollo. NO es un proveedor real: en desarrollo imprime el token
 * y el magic link para poder probar el flujo; en producción (AUDIT-SEC-004) sólo registra que
 * la operación no pudo entregarse, **sin volcar el token ni la URL a los logs** — un token de
 * reseteo válido en `docker logs` es una vía de toma de cuenta.
 */
export class ConsoleEmailService implements IEmailService {
  private lastSentEmail: SendPasswordResetEmailDTO | null = null;

  public async sendPasswordResetEmail(dto: SendPasswordResetEmailDTO): Promise<void> {
    this.lastSentEmail = dto;

    if (process.env.NODE_ENV === 'production') {
      console.error(
        `[ConsoleEmailService] Recuperación de PIN solicitada para <${dto.to}> pero NO hay proveedor de email real configurado. ` +
          'El enlace de recuperación no se envió (token omitido de los logs a propósito). Inyecta un IEmailService real.'
      );
      return;
    }

    console.log('\n========================================');
    console.log('📧 [ConsoleEmailService] PASSWORD RESET EMAIL DISPATCHED (dev)');
    console.log(`👤 Destinatario: ${dto.recipientName} <${dto.to}>`);
    console.log(`🔑 Token Temporal: ${dto.resetToken}`);
    console.log(`🔗 Magic Link: ${dto.resetUrl}`);
    console.log(`⏱️  Expira en: ${dto.expiresInMinutes} minutos`);
    console.log('========================================\n');
  }

  public getLastSentEmail(): SendPasswordResetEmailDTO | null {
    return this.lastSentEmail;
  }

  public clearLastSentEmail(): void {
    this.lastSentEmail = null;
  }
}
