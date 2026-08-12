import { InvariantViolationError, NotFoundError, ValidationError } from "@/domain/errors";
import { computeOneOffPrice } from "@/domain/subscriptions/pricing";
import {
  checkEligibility,
  checkOneOffEligibility,
  type Eligibility,
} from "@/domain/subscriptions/eligibility";
import type { RentalRepository, RentalSummary } from "@/repositories/rental.repository";
import type { SetRepository } from "@/repositories/set.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";
import type { SubscriptionRepository } from "@/repositories/subscription.repository";

import type { Emitter } from "../notifications/notify";

export interface RequestSetDeps {
  rentals: RentalRepository;
  subscriptions: SubscriptionRepository;
  sets: SetRepository;
  settings: SettingsRepository;
  emit?: Emitter;
  now?: () => Date;
}

export type RequestSetResult =
  | { outcome: "assigned"; rental: RentalSummary }
  /**
   * No quedaban copias libres. No es un error: la spec dice que en ese caso se le
   * **ofrece la cola**, así que se devuelve esa opción en vez de un fallo.
   */
  | { outcome: "no_copy_available"; canQueue: true };

/**
 * Solicitud de un set por un suscriptor (spec `rentals-returns`).
 *
 * El orden es deliberado: elegibilidad → dirección → asignación. Comprobar primero lo
 * que no toca la base evita reservar una copia para luego tener que soltarla.
 */
export async function requestSet(
  { rentals, subscriptions, sets, settings, emit, now = () => new Date() }: RequestSetDeps,
  input: { userId: string; setId: string }
): Promise<RequestSetResult> {
  const set = await sets.findById(input.setId);
  if (!set || !set.published) throw new NotFoundError("El set no existe o no está publicado.");

  const [subscription, currentCopyStates, config] = await Promise.all([
    subscriptions.findCurrentSubscription(input.userId),
    subscriptions.currentCopyStates(input.userId),
    settings.load(),
  ]);

  const at = now();
  const isSubscription = subscription?.status === "ACTIVE";

  // Dos vías distintas, no una con excepciones: quien no está suscrito no tiene plan
  // ni antigüedad, así que las reglas que se le aplican son otras (alquiler puntual).
  const eligibility: Eligibility = isSubscription
    ? checkEligibility({
        subscription: {
          status: subscription.status,
          startedAt: subscription.startedAt,
          maxSimultaneousSets: subscription.maxSimultaneousSets,
        },
        currentCopyStates,
        set: { restricted: set.restricted },
        restrictedSetMinMonths: config.restrictedSetMinMonths,
        now: at,
      })
    : checkOneOffEligibility({
        currentCopyStates,
        set: { restricted: set.restricted, hasReferenceValue: set.referenceValue !== null },
      });

  if (!eligibility.eligible) {
    // Aquí sí es un rechazo: el usuario pidió una acción concreta y no cumple los
    // requisitos. El `code` estable permite al cliente reaccionar sin leer el texto.
    throw new InvariantViolationError("NOT_ELIGIBLE", eligibility.detail);
  }

  const shippingAddress = await rentals.findDefaultAddress(input.userId);
  if (!shippingAddress) {
    throw new ValidationError([
      { field: "address", issue: "Necesitas una dirección de envío para recibir un set." },
    ]);
  }

  const price =
    !isSubscription && set.referenceValue
      ? computeOneOffPrice({
          referenceValue: set.referenceValue,
          percent: config.oneOffRentalPricePercent,
          minimum: config.oneOffRentalMinPrice,
        }).amount
      : null;

  const result = await rentals.assignAvailableCopy({
    setId: input.setId,
    userId: input.userId,
    subscriptionId: isSubscription ? subscription.id : null,
    type: isSubscription ? "SUBSCRIPTION" : "ONE_OFF",
    price,
    shippingAddress,
    at,
  });

  if (result.outcome === "no_copy_available") {
    return { outcome: "no_copy_available", canQueue: true };
  }

  await emit?.({
    type: "rental.confirmed",
    userId: input.userId,
    rentalId: result.rental.id,
    setId: input.setId,
    setName: set.name,
  });

  return { outcome: "assigned", rental: result.rental };
}
