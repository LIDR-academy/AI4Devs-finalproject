export const EMAIL_PORT = Symbol('EMAIL_PORT');

export type EmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'failed';

export interface EmailMessage {
  to: string;
  cc?: string[];
  subject: string;
  html: string;
  text: string;
}

export interface EmailSendResult {
  messageId: string;
}

export interface EmailPort {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
