import { InvariantViolationError, NotFoundError } from "@/domain/errors";
import { effectiveEntryOnEnqueue } from "@/domain/reservation-queue/ordering";
import { monthsBetween } from "@/domain/subscriptions/eligibility";
import type { QueueEntrySummary, QueueRepository } from "@/repositories/queue.repository";
import type { SetRepository } from "@/repositories/set.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";
import type { SubscriptionRepository } from "@/repositories/subscription.repository";

export interface QueueDeps {
  queue: QueueRepository;
  subscriptions: SubscriptionRepository;
  sets: SetRepository;
  settings: SettingsRepository;
  now?: () => Date;
}

/**
 * Une al suscriptor a la cola de un Set (spec `reservation-queue`).
 *
 * La entrada efectiva se calcula **una sola vez, aquí**, congelando el bono del plan
 * vigente (D11). A partir de ese momento no se recalcula nada: por ser la prioridad
 * aditiva, el orden es invariante en el tiempo.
 *
 * Ojo con lo que **no** se comprueba: el tope de sets del plan. Encolarse para más
 * adelante es legítimo aunque ahora mismo tengas el máximo fuera — la elegibilidad se
 * vuelve a mirar al ofrecer (D5), que es cuando importa de verdad.
 */
export async function joinQueue(
  { queue, subscriptions, sets, settings, now = () => new Date() }: QueueDeps,
  input: { userId: string; setId: string }
): Promise<QueueEntrySummary> {
  const set = await sets.findById(input.setId);
  if (!set || !set.published) throw new NotFoundError("El set no existe o no está publicado.");

  const [subscription, config, existing, activeQueues] = await Promise.all([
    subscriptions.findCurrentSubscription(input.userId),
    settings.load(),
    queue.findEntryForUserAndSet(input.userId, input.setId),
    queue.countActiveQueuesForUser(input.userId),
  ]);

  if (!subscription || subscription.status !== "ACTIVE") {
    throw new InvariantViolationError(
      "NOT_ELIGIBLE",
      "Necesitas una suscripción activa para entrar en una cola."
    );
  }

  if (existing) {
    throw new InvariantViolationError("NOT_ELIGIBLE", "Ya estás en la cola de este set.");
  }

  if (activeQueues >= config.maxQueuesPerUser) {
    throw new InvariantViolationError(
      "QUEUE_LIMIT_EXCEEDED",
      `Solo puedes estar en ${config.maxQueuesPerUser} cola(s) a la vez.`
    );
  }

  const at = now();

  // La antigüedad sí se comprueba al encolar: si el set exige veteranía, esperar en la
  // cola no la otorga, y dejar entrar a quien nunca podrá aceptarlo solo alarga la
  // cola a costa de los demás.
  if (set.restricted) {
    const months = monthsBetween(subscription.startedAt, at);
    if (months < config.restrictedSetMinMonths) {
      throw new InvariantViolationError(
        "NOT_ELIGIBLE",
        `Este set requiere ${config.restrictedSetMinMonths} meses de antigüedad; llevas ${months}.`
      );
    }
  }

  return queue.createEntry({
    setId: input.setId,
    userId: input.userId,
    enqueuedAt: at,
    appliedBonusDays: subscription.queueBonusDays,
    effectiveEntryAt: effectiveEntryOnEnqueue(at, subscription.queueBonusDays),
  });
}

/** Abandono voluntario de una cola. */
export async function leaveQueue(
  { queue }: QueueDeps,
  input: { userId: string; entryId: string }
): Promise<void> {
  const entry = await queue.findEntryById(input.entryId);
  if (!entry || entry.userId !== input.userId) {
    // Mismo error para "no existe" y "no es tuya": distinguirlos permitiría sondear
    // qué entradas de cola hay.
    throw new NotFoundError("No estás en esa cola.");
  }

  const left = await queue.leaveQueue(input.entryId);
  if (!left) {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      "Tienes una oferta en curso para este set: respóndela antes de salir de la cola."
    );
  }
}
