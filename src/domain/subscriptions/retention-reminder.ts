/**
 * Política de recordatorios de retención (D7 / spec `subscriptions`).
 *
 * Son recordatorios **amables**, no penalizaciones: el suscriptor puede retener el set
 * mientras dure su suscripción. Por eso solo se envían cuando hay alguien esperando —
 * si nadie lo ha pedido, meter prisa no aporta nada y solo molesta.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReminderInput {
  /** El admin activó los recordatorios para este Set. */
  enabled: boolean;
  cadenceDays: number;
  /** Cuánta gente espera este Set ahora mismo. */
  queueLength: number;
  /**
   * Desde cuándo se cuenta: el último recordatorio enviado o, si no hubo ninguno, el
   * inicio del alquiler.
   */
  since: Date;
  now: Date;
}

export function isReminderDue(input: ReminderInput): boolean {
  if (!input.enabled) return false;
  // Sin cola no hay a quién beneficiar metiendo prisa.
  if (input.queueLength <= 0) return false;
  if (input.cadenceDays <= 0) return false;

  const elapsedMs = input.now.getTime() - input.since.getTime();
  return elapsedMs >= input.cadenceDays * DAY_MS;
}

/** Cuándo tocaría el siguiente recordatorio. Útil para explicarlo en el back-office. */
export function nextReminderAt(since: Date, cadenceDays: number): Date {
  return new Date(since.getTime() + Math.max(1, cadenceDays) * DAY_MS);
}
