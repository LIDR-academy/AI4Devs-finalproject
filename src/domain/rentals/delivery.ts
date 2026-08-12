/**
 * Registro de condición en la entrega y su confirmación (D8 / spec `rentals-returns`).
 *
 * Sin un registro "antes" no se puede atribuir con certeza una rotura o una pieza
 * perdida al periodo de alquiler de un suscriptor concreto. Es la base documental de
 * cualquier reclamación, no un trámite.
 */

const HOUR_MS = 60 * 60 * 1000;

export type DeliveryConfirmation =
  /** Aún se puede reportar una discrepancia. */
  | { status: "pending"; expiresAt: Date }
  /** El suscriptor reportó que lo recibido no coincide con el registro. */
  | { status: "disputed" }
  /** Pasó la ventana sin reclamación: se da por conforme. */
  | { status: "tacit" };

export interface DeliveryConfirmationInput {
  /** Instante del registro de condición previo al envío. */
  reportedAt: Date;
  windowHours: number;
  hasDiscrepancy: boolean;
  now: Date;
}

/**
 * Estado de la confirmación de entrega.
 *
 * La conformidad tácita **no necesita guardarse**: es la ausencia de discrepancia una
 * vez pasada la ventana, y se deduce de lo que ya hay registrado. Persistir un
 * "confirmado tácitamente" obligaría a un proceso que lo escribiera y a mantenerlo en
 * sincronía, para no añadir ninguna información nueva.
 */
export function deliveryConfirmation(input: DeliveryConfirmationInput): DeliveryConfirmation {
  if (input.hasDiscrepancy) return { status: "disputed" };

  const expiresAt = new Date(input.reportedAt.getTime() + input.windowHours * HOUR_MS);
  return input.now.getTime() >= expiresAt.getTime()
    ? { status: "tacit" }
    : { status: "pending", expiresAt };
}

/** ¿Sigue abierta la ventana para reportar una discrepancia? */
export function canReportDiscrepancy(input: DeliveryConfirmationInput): boolean {
  return deliveryConfirmation(input).status === "pending";
}
