import { notificationsFor, type DomainEvent } from "@/domain/notifications/events";
import type { NotificationRepository } from "@/repositories/notification.repository";

export interface NotifyDeps {
  notifications: NotificationRepository;
  now?: () => Date;
}

export interface NotifyResult {
  /** Avisos efectivamente creados. */
  sent: number;
  /** Descartados por ser repetición de uno ya enviado. */
  duplicates: number;
}

/**
 * Publica un evento de dominio y crea los avisos que provoca.
 *
 * **Nunca propaga errores.** Notificar es un efecto secundario del negocio: que no se
 * pueda avisar a alguien no puede tumbar el alquiler, la devolución o la baja que ya
 * han ocurrido. Los fallos se registran y se sigue.
 */
export async function emit(
  { notifications, now = () => new Date() }: NotifyDeps,
  event: DomainEvent
): Promise<NotifyResult> {
  const at = now();
  const planned = notificationsFor(event);
  let sent = 0;
  let duplicates = 0;

  for (const notification of planned) {
    try {
      const recipients =
        notification.audience.kind === "user"
          ? [notification.audience.userId]
          : await notifications.listStaffRecipients();

      for (const userId of recipients) {
        const created = await notifications.create({
          userId,
          type: notification.type,
          payload: notification.payload,
          relatedEntityType: notification.relatedEntityType,
          relatedEntityId: notification.relatedEntityId,
          // La clave incluye al destinatario: un aviso interno va a varias personas y
          // cada una debe recibir el suyo, pero solo uno.
          dedupeKey: `${notification.dedupeKey}:${userId}`,
          at,
        });
        if (created) sent++;
        else duplicates++;
      }
    } catch (error) {
      console.error("[notifications] No se pudo emitir el aviso:", event.type, error);
    }
  }

  return { sent, duplicates };
}

/** Emisor listo para inyectar en los casos de uso que provocan eventos. */
export type Emitter = (event: DomainEvent) => Promise<unknown>;

export function emitterFor(deps: NotifyDeps): Emitter {
  return (event) => emit(deps, event);
}
