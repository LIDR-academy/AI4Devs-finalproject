import { NotFoundError } from "@/domain/errors";
import { checkEligibility, type Eligibility } from "@/domain/subscriptions/eligibility";
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
}

/**
 * ¿Puede este usuario llevarse este set, y si no, por qué?
 *
 * Reúne las cuatro reglas de la spec —plan activo, límite de plan, devolución sin
 * completar y antigüedad mínima— en una sola respuesta, para que la interfaz pueda
 * explicar el motivo concreto en vez de un "no puedes" sin más.
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

  // Las mismas reglas que en la solicitud, con la misma función: si esta pantalla
  // dijera que sí y el endpoint que no, el suscriptor vería un botón que falla.
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

  return { eligibility };
}
