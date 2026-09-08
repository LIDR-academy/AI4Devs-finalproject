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

const DAY_MS = 24 * 60 * 60 * 1000;

export function daysToMs(days: number): number {
  return Math.max(0, days) * DAY_MS;
}

/**
 * Entrada efectiva al **encolarse**: se congela el bono del plan vigente en ese
 * momento (D11). Un cambio posterior del bono por el admin no reordena la cola, solo
 * afecta a quien se encole después.
 */
export function effectiveEntryOnEnqueue(enqueuedAt: Date, planBonusDays: number): Date {
  return computeEffectiveEntryAt(enqueuedAt, daysToMs(planBonusDays));
}

/**
 * Entrada efectiva al **volver a la cola tras dejar caducar una oferta** (D5).
 *
 * Se sitúa en `ahora + penalización`: por delante no queda nadie, porque todos los que
 * esperan entraron antes, y la penalización lo retrasa además unos días. **No se
 * vuelve a aplicar el bono del plan**: el bono premia entrar en la cola, no volver a
 * ella después de haber desatendido un turno; sumarlo aquí podría colocar a un premium
 * por delante de alguien que acaba de encolarse sin haber fallado a nada.
 *
 * No es una expulsión: conserva su sitio en la cola, solo que al final.
 */
export function effectiveEntryOnRequeue(now: Date, penaltyDays: number): Date {
  return new Date(now.getTime() + daysToMs(penaltyDays));
}

/** Instante del recordatorio a mitad de ventana de una oferta (D5). */
export function offerReminderAt(offeredAt: Date, expiresAt: Date): Date {
  return new Date(offeredAt.getTime() + (expiresAt.getTime() - offeredAt.getTime()) / 2);
}

/** Puesto que ocupa una entrada dentro de la cola de su Set, con el total. */
export interface QueuePlacement {
  /** 1-based: el 1 es a quien se ofrecerá la próxima copia libre. */
  position: number;
  /** Cuántos esperan en esa cola, para leer el puesto en contexto ("2.º de 5"). */
  queueLength: number;
}

/**
 * Puesto de cada entrada dentro de la cola de su Set (`wireframes.md` §8.4).
 *
 * Recibe **todas** las entradas vivas de los Sets que interesen —no solo las de un
 * usuario— y las agrupa por Set antes de ordenarlas con `orderQueue`. Que el criterio
 * sea el mismo que sirve las ofertas no es un detalle: si la pantalla contase de otra
 * forma, diría un puesto que el motor de cola no respeta.
 */
export function placeInQueues<T extends QueueOrderable & { setId: string }>(
  entries: readonly T[]
): Map<string, QueuePlacement> {
  const bySet = new Map<string, T[]>();
  for (const entry of entries) {
    const group = bySet.get(entry.setId);
    if (group) group.push(entry);
    else bySet.set(entry.setId, [entry]);
  }

  const placements = new Map<string, QueuePlacement>();
  for (const group of bySet.values()) {
    const ordered = orderQueue(group);
    ordered.forEach((entry, index) => {
      placements.set(entry.id, { position: index + 1, queueLength: ordered.length });
    });
  }
  return placements;
}
