/**
 * Motor de notificaciones dirigido por eventos de dominio (spec `notifications`).
 *
 * La pieza central es una **función pura**: evento → notificaciones a crear. Que sea
 * pura es lo que permite comprobar en un test que cada evento produce exactamente su
 * aviso, sin base de datos ni transporte de por medio.
 *
 * Cada notificación lleva una **clave de idempotencia** derivada del propio evento. Es
 * lo que hace que un reintento —un job que se solapa, una petición repetida— no
 * genere un segundo aviso: la clave sale igual, y el índice único la rechaza.
 */

export const NOTIFICATION_TYPES = [
  // Al suscriptor.
  "QUEUE_TURN",
  "OFFER_REMINDER",
  "OFFER_EXPIRED",
  "RENTAL_CONFIRMED",
  "RETURN_RECEIVED",
  "RETURN_COMPLETED",
  "RETENTION_REMINDER",
  // Al back-office.
  "COPY_INCOMPLETE",
  "COPY_RETIRED",
  "DELIVERY_DISCREPANCY_REPORTED",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** A quién va dirigida. El back-office se resuelve como abanico al enviar. */
export type Audience = { kind: "user"; userId: string } | { kind: "backoffice" };

export interface PlannedNotification {
  audience: Audience;
  type: NotificationType;
  payload: Record<string, unknown>;
  relatedEntityType: string;
  relatedEntityId: string;
  /** Identidad del aviso: dos eventos iguales producen la misma clave. */
  dedupeKey: string;
}

export type DomainEvent =
  | {
      type: "offer.created";
      userId: string;
      offerId: string;
      setId: string;
      setName: string;
      windowExpiresAt: Date;
    }
  | { type: "offer.reminder"; userId: string; offerId: string; setId: string; setName: string }
  | { type: "offer.expired"; userId: string; offerId: string; setId: string; setName: string }
  | {
      type: "rental.confirmed";
      userId: string;
      rentalId: string;
      setId: string;
      setName: string;
    }
  | { type: "return.received"; userId: string; rentalId: string; setName: string }
  | { type: "return.completed"; userId: string; rentalId: string; setName: string }
  | {
      type: "retention.reminder";
      userId: string;
      rentalId: string;
      setName: string;
      /** Se incluye para que el aviso pueda repetirse en cada ciclo de la cadencia. */
      cycle: string;
    }
  | { type: "copy.incomplete"; copyId: string; setName: string; rentalId: string | null }
  | { type: "copy.retired"; copyId: string; setName: string; reason: string | null }
  | {
      type: "delivery.discrepancy";
      copyId: string;
      rentalId: string;
      setName: string;
      notes: string;
    };

/**
 * Traduce un evento de dominio a las notificaciones que provoca.
 *
 * Un evento puede no producir ninguna (lista vacía) o varias: quién debe enterarse de
 * qué es una decisión de negocio, no del sitio donde ocurre el evento.
 */
export function notificationsFor(event: DomainEvent): readonly PlannedNotification[] {
  switch (event.type) {
    case "offer.created":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "QUEUE_TURN",
          // La ventana viaja en el aviso: "te toca" sin decir hasta cuándo obligaría
          // a entrar en la aplicación para saber si aún se está a tiempo.
          payload: {
            setId: event.setId,
            setName: event.setName,
            windowExpiresAt: event.windowExpiresAt.toISOString(),
          },
          relatedEntityType: "ReservationOffer",
          relatedEntityId: event.offerId,
          dedupeKey: `QUEUE_TURN:${event.offerId}`,
        },
      ];

    case "offer.reminder":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "OFFER_REMINDER",
          payload: { setId: event.setId, setName: event.setName },
          relatedEntityType: "ReservationOffer",
          relatedEntityId: event.offerId,
          dedupeKey: `OFFER_REMINDER:${event.offerId}`,
        },
      ];

    case "offer.expired":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "OFFER_EXPIRED",
          payload: { setId: event.setId, setName: event.setName },
          relatedEntityType: "ReservationOffer",
          relatedEntityId: event.offerId,
          dedupeKey: `OFFER_EXPIRED:${event.offerId}`,
        },
      ];

    case "rental.confirmed":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "RENTAL_CONFIRMED",
          payload: { setId: event.setId, setName: event.setName },
          relatedEntityType: "Rental",
          relatedEntityId: event.rentalId,
          dedupeKey: `RENTAL_CONFIRMED:${event.rentalId}`,
        },
      ];

    case "return.received":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "RETURN_RECEIVED",
          payload: { setName: event.setName },
          relatedEntityType: "Rental",
          relatedEntityId: event.rentalId,
          dedupeKey: `RETURN_RECEIVED:${event.rentalId}`,
        },
      ];

    case "return.completed":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "RETURN_COMPLETED",
          payload: { setName: event.setName },
          relatedEntityType: "Rental",
          relatedEntityId: event.rentalId,
          dedupeKey: `RETURN_COMPLETED:${event.rentalId}`,
        },
      ];

    case "retention.reminder":
      return [
        {
          audience: { kind: "user", userId: event.userId },
          type: "RETENTION_REMINDER",
          payload: { setName: event.setName },
          relatedEntityType: "Rental",
          relatedEntityId: event.rentalId,
          // Lleva el ciclo: a diferencia del resto, este aviso **debe** repetirse cada
          // X días, así que la clave cambia con cada ciclo pero sigue impidiendo dos
          // envíos dentro del mismo.
          dedupeKey: `RETENTION_REMINDER:${event.rentalId}:${event.cycle}`,
        },
      ];

    case "copy.incomplete":
      return [
        {
          audience: { kind: "backoffice" },
          type: "COPY_INCOMPLETE",
          payload: { copyId: event.copyId, setName: event.setName, rentalId: event.rentalId },
          relatedEntityType: "Copy",
          relatedEntityId: event.copyId,
          // Por copia y no por incidencia: una copia puede marcarse incompleta más de
          // una vez a lo largo de su vida, y cada vez merece su aviso.
          dedupeKey: `COPY_INCOMPLETE:${event.copyId}:${event.rentalId ?? "sin-alquiler"}`,
        },
      ];

    case "copy.retired":
      return [
        {
          audience: { kind: "backoffice" },
          type: "COPY_RETIRED",
          payload: { copyId: event.copyId, setName: event.setName, reason: event.reason },
          relatedEntityType: "Copy",
          relatedEntityId: event.copyId,
          // La baja es terminal, así que la copia identifica el evento sin ambigüedad.
          dedupeKey: `COPY_RETIRED:${event.copyId}`,
        },
      ];

    case "delivery.discrepancy":
      return [
        {
          audience: { kind: "backoffice" },
          type: "DELIVERY_DISCREPANCY_REPORTED",
          payload: { copyId: event.copyId, setName: event.setName, notes: event.notes },
          relatedEntityType: "Rental",
          relatedEntityId: event.rentalId,
          dedupeKey: `DELIVERY_DISCREPANCY_REPORTED:${event.rentalId}`,
        },
      ];
  }
}
