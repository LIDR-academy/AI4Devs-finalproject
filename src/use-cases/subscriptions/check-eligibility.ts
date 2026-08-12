import { NotFoundError } from "@/domain/errors";
import { computeOneOffPrice, type OneOffPrice } from "@/domain/subscriptions/pricing";
import {
  checkEligibility,
  type Eligibility,
} from "@/domain/subscriptions/eligibility";
import type { SettingsRepository } from "@/repositories/settings.repository";
import type { SetRepository } from "@/repositories/set.repository";
import type { SubscriptionRepository } from "@/repositories/subscription.repository";

export interface EligibilityDeps {
  subscriptions: SubscriptionRepository;
  sets: SetRepository;
  settings: SettingsRepository;
  now?: () => Date;
}

export interface SetEligibility {
  eligibility: Eligibility;
  /**
   * Presupuesto del alquiler puntual. Se ofrece **precisamente** cuando no hay
   * suscripción activa: es la alternativa para quien no puede llevárselo por plan.
   */
  oneOffPrice: OneOffPrice | null;
}

/**
 * ¿Puede este usuario llevarse este set, y si no, por qué?
 *
 * Reúne las tres reglas de la spec —límite de plan, devolución sin completar y
 * antigüedad mínima— en una sola respuesta, para que la interfaz pueda explicar el
 * motivo concreto en vez de un "no puedes" sin más.
 */
export async function checkSetEligibility(
  { subscriptions, sets, settings, now = () => new Date() }: EligibilityDeps,
  input: { userId: string; setId: string }
): Promise<SetEligibility> {
  const set = await sets.findById(input.setId);
  if (!set || !set.published) throw new NotFoundError("El set no existe o no está publicado.");

  const [subscription, currentCopyStates, config] = await Promise.all([
    subscriptions.findCurrentSubscription(input.userId),
    subscriptions.currentCopyStates(input.userId),
    settings.load(),
  ]);

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
    now: now(),
  });

  const hasActiveSubscription = subscription?.status === "ACTIVE";
  const oneOffPrice =
    !hasActiveSubscription && set.referenceValue
      ? computeOneOffPrice({
          referenceValue: set.referenceValue,
          percent: config.oneOffRentalPricePercent,
          minimum: config.oneOffRentalMinPrice,
        })
      : null;

  return { eligibility, oneOffPrice };
}
