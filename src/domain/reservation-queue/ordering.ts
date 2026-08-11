/**
 * Orden de la cola de reservas — lógica pura de dominio (design.md D11).
 *
 * El orden es por **entrada efectiva inmutable**: al encolar se calcula una sola vez
 *   effectiveEntryAt = enqueuedAt − bonoAplicado
 * y NO se recalcula. Un bono mayor (p. ej. plan PREMIUM) adelanta la entrada en el
 * tiempo, de modo que con el paso de los días un BASIC puede adelantar a un PREMIUM
 * que entró después (prioridad por envejecimiento aditiva, sin score materializado).
 *
 * Sin dependencias de framework ni de Prisma: entra y sale con tipos planos.
 */

/** Entrada mínima necesaria para ordenar. `id` desempata de forma estable. */
export interface QueueOrderable {
  id: string;
  effectiveEntryAt: Date;
}

/**
 * Calcula la entrada efectiva a partir del instante de encolado y el bono aplicado
 * (en milisegundos, ≥ 0). Se invoca una única vez, al encolar.
 */
export function computeEffectiveEntryAt(
  enqueuedAt: Date,
  appliedBonusMs: number
): Date {
  if (appliedBonusMs < 0) {
    throw new RangeError("appliedBonusMs no puede ser negativo");
  }
  return new Date(enqueuedAt.getTime() - appliedBonusMs);
}

/**
 * Comparador para `Array.prototype.sort`: primero la menor `effectiveEntryAt`
 * (más antigua = más prioritaria); empate → menor `id` (estable y determinista).
 */
export function compareQueueEntries(
  a: QueueOrderable,
  b: QueueOrderable
): number {
  const delta = a.effectiveEntryAt.getTime() - b.effectiveEntryAt.getTime();
  if (delta !== 0) return delta;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/** Devuelve una copia ordenada de las entradas por su orden efectivo. */
export function orderQueue<T extends QueueOrderable>(entries: readonly T[]): T[] {
  return [...entries].sort(compareQueueEntries);
}
