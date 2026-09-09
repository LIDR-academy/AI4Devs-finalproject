export interface SendPasswordResetEmailDTO {
  to: string;
  recipientName: string;
  resetToken: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface IEmailService {
  sendPasswordResetEmail(dto: SendPasswordResetEmailDTO): Promise<void>;
}
