import type { NotificationType } from "@/domain/notifications/events";

export interface NotificationView {
  id: string;
  type: NotificationType | string;
  payload: Record<string, unknown> | null;
  sentAt: Date;
  readAt: Date | null;
}

/** Puerto de notificaciones (capability `notifications`). */
export interface NotificationRepository {
  /**
   * Crea la notificación **si no existe ya** una con la misma clave de idempotencia.
   * Devuelve `false` cuando se descartó por duplicada, para que quien llama pueda
   * distinguir "enviada" de "ya estaba".
   */
  create(input: {
    userId: string;
    type: string;
    payload?: Record<string, unknown> | null;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    dedupeKey?: string | null;
    at: Date;
  }): Promise<boolean>;

  /** Destinatarios del back-office (operadores y admins) para los avisos internos. */
  listStaffRecipients(): Promise<readonly string[]>;

  listForUser(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number }
  ): Promise<readonly NotificationView[]>;

  /**
   * Cuántos avisos sin leer tiene. Es lo único de la cabecera del portal que cambia
   * sin que el suscriptor haga nada, y se pinta en **todas** sus páginas: contar en la
   * base es más barato que traerse la lista para medirla.
   */
  countUnread(userId: string): Promise<number>;

  /** Marca como leída una notificación **del propio usuario**. */
  markRead(input: { notificationId: string; userId: string; at: Date }): Promise<boolean>;
}
