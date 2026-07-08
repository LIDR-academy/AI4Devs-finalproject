/**
 * NotificationPort.
 * Adapter: ConsoleNotificationAdapter (MVP). Future: email, push.
 */
export interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPort {
  send(payload: NotificationPayload): Promise<void>;
}
