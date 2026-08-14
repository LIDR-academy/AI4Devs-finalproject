import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  EmailMessage,
  EmailPort,
  EmailSendResult,
} from '../ports/email.port';

@Injectable()
export class ConsoleEmailAdapter implements EmailPort {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.logger.log(
      `Console email to=${message.to} cc=${(message.cc ?? []).join(',') || '-'} subject=${message.subject}`,
    );
    return { messageId: `console-${randomUUID()}` };
  }
}
