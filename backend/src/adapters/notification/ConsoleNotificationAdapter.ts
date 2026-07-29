/**
 * ConsoleNotificationAdapter — MVP stub. Logs to console.
 * Future: email, push, SMS.
 */
import type { NotificationPort, NotificationPayload } from '../../domain/ports/NotificationPort';
import pino from 'pino';

const logger = pino({ level: 'info' });

export class ConsoleNotificationAdapter implements NotificationPort {
  async send(payload: NotificationPayload): Promise<void> {
    logger.info({ notification: payload }, 'notification sent (console adapter)');
  }
}
