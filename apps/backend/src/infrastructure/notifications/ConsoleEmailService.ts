import { IEmailService, SendPasswordResetEmailDTO } from '../../domain/auth/ports/IEmailService.js';

export class ConsoleEmailService implements IEmailService {
  private lastSentEmail: SendPasswordResetEmailDTO | null = null;

  public async sendPasswordResetEmail(dto: SendPasswordResetEmailDTO): Promise<void> {
    this.lastSentEmail = dto;
    console.log('\n========================================');
    console.log('📧 [ConsoleEmailService] PASSWORD RESET EMAIL DISPATCHED');
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
