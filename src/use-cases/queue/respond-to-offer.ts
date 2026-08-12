import { ForbiddenError, InvariantViolationError, NotFoundError } from "@/domain/errors";
import { effectiveEntryOnRequeue, offerReminderAt } from "@/domain/reservation-queue/ordering";
import type { QueueRepository } from "@/repositories/queue.repository";
import type { RentalRepository } from "@/repositories/rental.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";
import type { SubscriptionRepository } from "@/repositories/subscription.repository";

import type { Emitter } from "../notifications/notify";
import { offerToHeadOfQueue } from "../rentals/advance-lifecycle";

export interface OfferDeps {
  queue: QueueRepository;
  rentals: RentalRepository;
  subscriptions: SubscriptionRepository;
  settings: SettingsRepository;
  /** Para reofertar al siguiente; se pasa aparte porque el flujo lo comparte con 5.6. */
  repository: import("@/repositories/copy.repository").CopyRepository;
  emit?: Emitter;
  now?: () => Date;
}

/** El suscriptor acepta la oferta: se le asigna la copia y abandona la cola. */
export async function acceptOffer(
  deps: OfferDeps,
  input: { userId: string; offerId: string }
): Promise<{ rentalId: string }> {
  const { queue, rentals, subscriptions, now = () => new Date() } = deps;

  const offer = await queue.findPendingOffer(input.offerId);
  if (!offer) throw new NotFoundError("La oferta no existe o ya no está vigente.");
  if (offer.userId !== input.userId) {
    throw new ForbiddenError("Esa oferta no es tuya.");
  }

  const at = now();
  if (offer.windowExpiresAt.getTime() <= at.getTime()) {
    throw new InvariantViolationError("OFFER_EXPIRED", "La ventana de confirmación ha caducado.");
  }

  const [subscription, shippingAddress] = await Promise.all([
    subscriptions.findCurrentSubscription(input.userId),
    rentals.findDefaultAddress(input.userId),
  ]);
  if (!shippingAddress) {
    throw new InvariantViolationError(
      "NOT_ELIGIBLE",
      "Necesitas una dirección de envío para recibir el set."
    );
  }

  const result = await queue.acceptOffer({
    offerId: input.offerId,
    at,
    subscriptionId: subscription?.status === "ACTIVE" ? subscription.id : null,
    shippingAddress,
  });

  if (!result) {
    // Entre la lectura y la escritura la oferta dejó de ser válida: caducó, la cerró
    // el barrido, o la copia se movió. El CAS lo detecta y aquí se traduce.
    throw new InvariantViolationError(
      "OFFER_EXPIRED",
      "La oferta ha dejado de estar vigente; vuelve a intentarlo."
    );
  }

  await deps.emit?.({
    type: "rental.confirmed",
    userId: input.userId,
    rentalId: result.rentalId,
    setId: offer.setId,
    setName: offer.setName,
  });

  return result;
}

/**
 * Rechazo explícito: la copia pasa **de inmediato** al siguiente elegible, sin esperar
 * al vencimiento de la ventana (D5). Quien rechaza sale de la cola: ha dicho que no.
 */
export async function rejectOffer(
  deps: OfferDeps,
  input: { userId: string; offerId: string }
): Promise<void> {
  const { queue, now = () => new Date() } = deps;

  const offer = await queue.findPendingOffer(input.offerId);
  if (!offer) throw new NotFoundError("La oferta no existe o ya no está vigente.");
  if (offer.userId !== input.userId) throw new ForbiddenError("Esa oferta no es tuya.");

  const closed = await queue.closeOffer({
    offerId: input.offerId,
    outcome: "REJECTED",
    at: now(),
    requeue: null,
  });
  if (!closed) {
    throw new InvariantViolationError("OFFER_EXPIRED", "La oferta ya no estaba vigente.");
  }

  await passToNext(deps, closed);
}

export interface ExpireOffersResult {
  expired: number;
  reoffered: number;
}

/**
 * Barrido de ofertas caducadas (lo invoca el scheduler).
 *
 * Quien no responde **no es expulsado**: vuelve a la cola con una entrada efectiva
 * nueva y penalizada, es decir, al final. Y la copia se ofrece al siguiente.
 */
export async function expireOffers(deps: OfferDeps): Promise<ExpireOffersResult> {
  const { queue, settings, now = () => new Date() } = deps;

  const at = now();
  const [expired, config] = await Promise.all([queue.findExpiredOffers(at), settings.load()]);

  let closedCount = 0;
  let reoffered = 0;

  for (const offer of expired) {
    try {
      const closed = await queue.closeOffer({
        offerId: offer.offerId,
        outcome: "EXPIRED",
        at,
        requeue: {
          effectiveEntryAt: effectiveEntryOnRequeue(at, config.expiredOfferPenaltyDays),
          penaltyDays: config.expiredOfferPenaltyDays,
        },
      });
      if (!closed) continue;
      closedCount++;

      await deps.emit?.({
        type: "offer.expired",
        userId: offer.userId,
        offerId: offer.offerId,
        setId: offer.setId,
        setName: offer.setName,
      });

      // Se excluye a quien acaba de dejarla caducar: si fuera el único en la cola se
      // la volveríamos a ofrecer al instante, en bucle.
      if (await passToNext(deps, { ...closed, excludeEntryId: offer.entryId })) reoffered++;
    } catch (error) {
      // Un fallo con una oferta no puede dejar las demás caducadas sin procesar.
      console.error("[queue] No se pudo caducar la oferta:", offer.offerId, error);
    }
  }

  return { expired: closedCount, reoffered };
}

export interface OfferRemindersResult {
  candidates: number;
  sent: number;
}

/** Recordatorio a mitad de ventana (D5). También lo invoca el scheduler. */
export async function sendOfferReminders(deps: OfferDeps): Promise<OfferRemindersResult> {
  const { queue, emit, now = () => new Date() } = deps;

  const at = now();
  const candidates = await queue.findOffersNeedingReminder(at);
  let sent = 0;

  for (const offer of candidates) {
    const reminderAt = offerReminderAt(offer.offeredAt, offer.windowExpiresAt);
    if (at.getTime() < reminderAt.getTime()) continue;

    try {
      await emit?.({
        type: "offer.reminder",
        userId: offer.userId,
        offerId: offer.offerId,
        setId: offer.setId,
        setName: offer.setName,
      });
      // Se marca aunque no haya notificador conectado: el recordatorio se considera
      // procesado y no debe repetirse en cada pasada.
      await queue.markReminderSent(offer.offerId, at);
      sent++;
    } catch (error) {
      console.error("[queue] No se pudo enviar el recordatorio:", offer.offerId, error);
    }
  }

  return { candidates: candidates.length, sent };
}

/** Ofrece la copia liberada al siguiente elegible de la cola. */
async function passToNext(
  deps: OfferDeps,
  closed: { copyId: string; setId: string; excludeEntryId?: string }
): Promise<boolean> {
  const offer = await offerToHeadOfQueue(
    {
      repository: deps.repository,
      queue: deps.queue,
      settings: deps.settings,
      rentals: deps.rentals,
      emit: deps.emit,
      now: deps.now,
    },
    closed
  );
  return offer !== null;
}
