/**
 * Vocabulario visual de los estados del dominio — `documents/design-system.md` §5.
 *
 * Un mismo estado se lee distinto según **quién** mira, y por eso casi todas las
 * funciones de aquí piden la superficie:
 *
 *  - El **operador** necesita el estado exacto: es su cola de trabajo, y la
 *    diferencia entre `EN_INSPECCION` y `EN_HIGIENIZACION` es qué le toca hacer.
 *  - El **suscriptor** necesita saber en qué punto está lo suyo. Los cinco estados
 *    que hay entre "la devolví" y "está cerrada" son un único hecho para él:
 *    devolución en curso. Detallárselos sería contarle nuestra logística.
 *
 * Y el **tono no es el sentimiento del estado, sino la urgencia para quien lee**.
 * `EN_INSPECCION` es `warning` para el operador —hay trabajo esperando— y `info`
 * para el suscriptor —no tiene que hacer nada—. Es el mismo hecho con dos lecturas,
 * y es justo lo que evita pintar de rojo cosas que van bien.
 *
 * Módulo de presentación: no lo importa nadie de `src/` (dominio → casos de uso →
 * repositorios), solo `app/` y `components/`.
 */

import type { CopyState } from "@/domain/copy/lifecycle";

export const TONES = ["neutral", "info", "success", "warning", "danger"] as const;

/**
 * - `neutral`: no pasa nada, o ya está archivado.
 * - `info`: en marcha, y no depende de quien mira.
 * - `success`: terminado bien, o disponible.
 * - `warning`: espera una acción de quien mira.
 * - `danger`: algo ha salido mal.
 */
export type Tone = (typeof TONES)[number];

export type Surface = "subscriber" | "backoffice";

export interface StatusLabel {
  /** Etiqueta corta, en frase (no en mayúsculas): es lo que va dentro de la píldora. */
  readonly label: string;
  readonly tone: Tone;
  /** Explicación de una línea, para las superficies que tengan sitio. */
  readonly hint?: string;
}

export type QueueEntryStatus = "WAITING" | "OFFERED" | "CONFIRMED" | "EXPIRED" | "LEFT";
export type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
export type RentalStatus = "ACTIVE" | "RETURN_INITIATED" | "IN_INSPECTION" | "COMPLETED";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type ConditionResult = "OK" | "INCOMPLETE" | "DAMAGED";

/* -------------------------------------------------------------------------- */
/* Copia                                                                       */
/* -------------------------------------------------------------------------- */

const COPY_BACKOFFICE = {
  INTAKE: { label: "Sin catalogar", tone: "warning", hint: "Recién llegada al almacén." },
  DISPONIBLE: { label: "Disponible", tone: "success" },
  OFRECIDA: { label: "Reservada", tone: "info", hint: "Guardada para quien tiene la oferta." },
  ALQUILADA: { label: "Con el cliente", tone: "info" },
  EN_DEVOLUCION: { label: "En camino de vuelta", tone: "info", hint: "Todavía no ha llegado." },
  EN_INSPECCION: { label: "Por inspeccionar", tone: "warning" },
  EN_HIGIENIZACION: { label: "Por higienizar", tone: "warning" },
  INCOMPLETA: { label: "Incompleta", tone: "danger", hint: "Faltan piezas por reponer." },
  BAJA: { label: "De baja", tone: "neutral", hint: "Fuera del inventario, para siempre." },
} as const satisfies Record<CopyState, StatusLabel>;

/**
 * Para el suscriptor, la copia solo puede estar en tres sitios: en su casa, de
 * vuelta, o disponible en el catálogo. Los cuatro estados del circuito de
 * devolución se funden en uno.
 */
const COPY_SUBSCRIBER = {
  INTAKE: { label: "Todavía no disponible", tone: "neutral" },
  DISPONIBLE: { label: "Disponible", tone: "success" },
  OFRECIDA: { label: "Reservada", tone: "info" },
  ALQUILADA: { label: "En tu poder", tone: "info", hint: "Devuélvelo cuando quieras." },
  EN_DEVOLUCION: { label: "Devolución en curso", tone: "info", hint: "Ya no tienes que hacer nada." },
  EN_INSPECCION: { label: "Devolución en curso", tone: "info", hint: "Ya no tienes que hacer nada." },
  EN_HIGIENIZACION: { label: "Devolución en curso", tone: "info", hint: "Ya no tienes que hacer nada." },
  INCOMPLETA: { label: "Devolución en curso", tone: "info", hint: "Ya no tienes que hacer nada." },
  BAJA: { label: "No disponible", tone: "neutral" },
} as const satisfies Record<CopyState, StatusLabel>;

/**
 * El mismo estado, leído como **trabajo pendiente** (`wireframes.md` §4.1).
 *
 * Solo cambia una cosa, y por un motivo concreto: en la cola de trabajo una copia
 * `ALQUILADA` **no está "con el cliente"** —está adjudicada y esperando a que alguien
 * la prepare—, así que se titula "Por preparar" y en tono `warning`, que es el que la
 * regla del sistema de diseño reserva para lo que espera una acción de quien lee. En la
 * ficha de catálogo, donde no hay nada que hacer con ella, sigue siendo "Con el
 * cliente". El resto de grupos se leen igual que en cualquier otra pantalla.
 */
export function workQueueGroup(state: CopyState): StatusLabel {
  if (state === "ALQUILADA") {
    return {
      label: "Por preparar",
      tone: "warning",
      hint: "Adjudicada y todavía sin envío preparado.",
    };
  }
  return copyStatus(state, "backoffice");
}

export function copyStatus(state: CopyState, surface: Surface): StatusLabel {
  return surface === "backoffice" ? COPY_BACKOFFICE[state] : COPY_SUBSCRIBER[state];
}

/* -------------------------------------------------------------------------- */
/* Cola de reservas                                                            */
/* -------------------------------------------------------------------------- */

const QUEUE_SUBSCRIBER = {
  WAITING: { label: "En espera", tone: "neutral", hint: "Te avisaremos cuando te toque." },
  // El único estado de todo el portal que pide algo al suscriptor, y por eso el
  // único `warning`: la ventana de confirmación caduca sola.
  OFFERED: { label: "Te toca", tone: "warning", hint: "Confirma antes de que caduque." },
  CONFIRMED: { label: "Confirmada", tone: "success" },
  EXPIRED: { label: "Caducada", tone: "neutral", hint: "Pasó el turno; puedes volver a la cola." },
  LEFT: { label: "Abandonada", tone: "neutral" },
} as const satisfies Record<QueueEntryStatus, StatusLabel>;

const QUEUE_BACKOFFICE = {
  WAITING: { label: "En espera", tone: "neutral" },
  OFFERED: { label: "Ofrecida", tone: "info" },
  CONFIRMED: { label: "Confirmada", tone: "success" },
  EXPIRED: { label: "Caducada", tone: "neutral" },
  LEFT: { label: "Abandonada", tone: "neutral" },
} as const satisfies Record<QueueEntryStatus, StatusLabel>;

export function queueStatus(status: QueueEntryStatus, surface: Surface): StatusLabel {
  return surface === "backoffice" ? QUEUE_BACKOFFICE[status] : QUEUE_SUBSCRIBER[status];
}

const OFFER = {
  PENDING: { label: "Pendiente de respuesta", tone: "warning" },
  ACCEPTED: { label: "Aceptada", tone: "success" },
  REJECTED: { label: "Rechazada", tone: "neutral" },
  EXPIRED: { label: "Caducada", tone: "neutral" },
} as const satisfies Record<OfferStatus, StatusLabel>;

/** La oferta se mira igual desde los dos lados: o está viva, o se resolvió. */
export function offerStatus(status: OfferStatus): StatusLabel {
  return OFFER[status];
}

/* -------------------------------------------------------------------------- */
/* Alquiler                                                                    */
/* -------------------------------------------------------------------------- */

const RENTAL_SUBSCRIBER = {
  ACTIVE: { label: "En tu poder", tone: "info" },
  RETURN_INITIATED: { label: "Devolución en curso", tone: "info" },
  IN_INSPECTION: { label: "Devolución en curso", tone: "info" },
  COMPLETED: { label: "Cerrado", tone: "neutral" },
} as const satisfies Record<RentalStatus, StatusLabel>;

const RENTAL_BACKOFFICE = {
  ACTIVE: { label: "En curso", tone: "info" },
  RETURN_INITIATED: { label: "Devolución iniciada", tone: "info" },
  IN_INSPECTION: { label: "En inspección", tone: "warning" },
  COMPLETED: { label: "Cerrado", tone: "neutral" },
} as const satisfies Record<RentalStatus, StatusLabel>;

export function rentalStatus(status: RentalStatus, surface: Surface): StatusLabel {
  return surface === "backoffice" ? RENTAL_BACKOFFICE[status] : RENTAL_SUBSCRIBER[status];
}

/* -------------------------------------------------------------------------- */
/* Suscripción, personal e incidencias                                         */
/* -------------------------------------------------------------------------- */

const SUBSCRIPTION = {
  ACTIVE: { label: "Activa", tone: "success" },
  // Ni pausada ni cancelada son un error: son decisiones del cliente. Lo que sí
  // hacen es impedir alquilar, y de eso avisa el texto que las acompaña.
  PAUSED: { label: "En pausa", tone: "neutral" },
  CANCELLED: { label: "Cancelada", tone: "neutral" },
} as const satisfies Record<SubscriptionStatus, StatusLabel>;

export function subscriptionStatus(status: SubscriptionStatus): StatusLabel {
  return SUBSCRIPTION[status];
}

const USER = {
  ACTIVE: { label: "Activo", tone: "success" },
  SUSPENDED: { label: "Suspendido", tone: "danger" },
} as const satisfies Record<UserStatus, StatusLabel>;

export function userStatus(status: UserStatus): StatusLabel {
  return USER[status];
}

const ROLE = {
  SUBSCRIBER: "Suscriptor",
  OPERATOR: "Operador",
  ADMIN: "Administrador",
} as const;

export type RoleName = keyof typeof ROLE;

/** El rol no tiene tono: no es un estado, es quién eres. */
export function roleLabel(role: RoleName): string {
  return ROLE[role];
}

const INCIDENT = {
  OPEN: { label: "Abierta", tone: "danger" },
  IN_PROGRESS: { label: "En curso", tone: "warning" },
  RESOLVED: { label: "Resuelta", tone: "success" },
} as const satisfies Record<IncidentStatus, StatusLabel>;

export function incidentStatus(status: IncidentStatus): StatusLabel {
  return INCIDENT[status];
}

const CONDITION = {
  OK: { label: "Correcta", tone: "success" },
  INCOMPLETE: { label: "Incompleta", tone: "warning" },
  DAMAGED: { label: "Dañada", tone: "danger" },
} as const satisfies Record<ConditionResult, StatusLabel>;

export function conditionResult(result: ConditionResult): StatusLabel {
  return CONDITION[result];
}

/* -------------------------------------------------------------------------- */
/* Planes y avisos                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Cuántos sets a la vez, dicho como se dice en voz alta. Estaba escrito tres veces
 * —planes, alta y portal— con dos redacciones distintas; una frase que describe una
 * regla del plan es vocabulario, y el vocabulario vive en un solo sitio.
 */
export function simultaneousSets(max: number): string {
  return max === 1 ? "1 set en casa a la vez" : `${max} sets en casa a la vez`;
}

/**
 * Los avisos se guardan con el nombre del evento de dominio (`QUEUE_TURN`), que es
 * lo correcto en la base y lo peor posible en pantalla. Aquí se traducen a lo que
 * la persona necesita leer en una lista.
 */
const NOTIFICATION = {
  QUEUE_TURN: "Te toca un set de tu cola",
  OFFER_REMINDER: "Tu oferta está a punto de caducar",
  OFFER_EXPIRED: "Se te ha pasado el turno",
  RENTAL_CONFIRMED: "Alquiler confirmado",
  RETURN_RECEIVED: "Hemos recibido tu devolución",
  RETURN_COMPLETED: "Devolución cerrada",
  RETENTION_REMINDER: "Llevas un tiempo con este set",
  COPY_INCOMPLETE: "Copia incompleta",
  COPY_RETIRED: "Copia dada de baja",
  DELIVERY_DISCREPANCY_REPORTED: "Un cliente ha reportado una discrepancia",
} as const;

export type NotificationLabelKey = keyof typeof NOTIFICATION;

export function notificationLabel(type: string): string {
  return NOTIFICATION[type as NotificationLabelKey] ?? type;
}
