import { InvariantViolationError, NotFoundError, ValidationError } from "@/domain/errors";
import { checkEligibility } from "@/domain/subscriptions/eligibility";
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
 * **Alquilar exige plan activo.** No hay vía paralela: quien no tiene suscripción no
 * puede llevarse un set, y el rechazo lo dice con su propio código para que el cliente
 * lo distinga del tope de plan — lo que resuelve cada caso es distinto (contratar o
 * reactivar un plan, frente a devolver un set).
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

  const eligibility = checkEligibility({
    subscription: subscription
      ? {
          status: subscription.status,
          startedAt: subscription.startedAt,
          maxSimultaneousSets: subscription.maxSimultaneousSets,
        }
      : null,
    currentCopyStates,
    set: { restricted: set.restricted },
    restrictedSetMinMonths: config.restrictedSetMinMonths,
    now: at,
  });

  if (!eligibility.eligible) {
    // Aquí sí es un rechazo: el usuario pidió una acción concreta y no cumple los
    // requisitos. El `code` estable permite al cliente reaccionar sin leer el texto,
    // y la falta de plan tiene el suyo propio porque se arregla de otra manera.
    throw new InvariantViolationError(
      eligibility.reason === "NO_ACTIVE_SUBSCRIPTION"
        ? "NO_ACTIVE_SUBSCRIPTION"
        : "NOT_ELIGIBLE",
      eligibility.detail
    );
  }

  // Ser elegible implica tener suscripción activa —es lo primero que mira
  // `checkEligibility`—; el guard está para que el tipo lo refleje.
  if (!subscription) {
    throw new InvariantViolationError(
      "NO_ACTIVE_SUBSCRIPTION",
      "Necesitas una suscripción activa para llevarte un set."
    );
  }

  const shippingAddress = await rentals.findDefaultAddress(input.userId);
  if (!shippingAddress) {
    throw new ValidationError([
      { field: "address", issue: "Necesitas una dirección de envío para recibir un set." },
    ]);
  }

  const result = await rentals.assignAvailableCopy({
    setId: input.setId,
    userId: input.userId,
    subscriptionId: subscription.id,
    // Sin alquiler puntual, todo alquiler nace de un plan. `price` se queda vacío: la
    // columna sigue en el esquema (design.md §3) pero ya no se puebla.
    type: "SUBSCRIPTION",
    price: null,
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
