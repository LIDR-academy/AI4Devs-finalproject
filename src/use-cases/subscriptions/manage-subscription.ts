import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { canEndSubscription } from "@/domain/subscriptions/eligibility";
import type { AuditRepository } from "@/repositories/audit.repository";
import type {
  ActiveSubscription,
  PlanConfig,
  SubscriptionRepository,
} from "@/repositories/subscription.repository";

export interface ManageSubscriptionDeps {
  subscriptions: SubscriptionRepository;
  audit: AuditRepository;
  now?: () => Date;
}

export interface Actor {
  id: string;
  role: Role;
}

/**
 * Pausa o cancela la suscripción del propio usuario.
 *
 * Se bloquea si tiene alguna copia en su poder: la devolución es obligatoria. Sin esta
 * regla, cancelar sería la vía fácil para quedarse con un set.
 */
export async function changeSubscriptionStatus(
  { subscriptions, now = () => new Date() }: ManageSubscriptionDeps,
  input: { userId: string; status: "ACTIVE" | "PAUSED" | "CANCELLED" }
): Promise<ActiveSubscription> {
  const subscription = await subscriptions.findCurrentSubscription(input.userId);
  if (!subscription) throw new NotFoundError("No tienes ninguna suscripción activa.");

  if (subscription.status === input.status) return subscription;

  if (input.status !== "ACTIVE") {
    const states = await subscriptions.currentCopyStates(input.userId);
    const verdict = canEndSubscription(states);
    if (!verdict.eligible) {
      throw new InvariantViolationError("NOT_ELIGIBLE", verdict.detail);
    }
  }

  const updated = await subscriptions.updateStatus(subscription.id, input.status, now());
  if (!updated) throw new NotFoundError("No tienes ninguna suscripción activa.");
  return updated;
}

/**
 * Cambia la configuración de un plan — solo admin.
 *
 * El precio y el límite de sets son parámetros de negocio (D9), no constantes: el
 * cambio queda registrado en auditoría con el antes y el después, que es lo que
 * permite explicar más adelante por qué un mes se facturó distinto.
 */
export async function updatePlanConfig(
  { subscriptions, audit, now = () => new Date() }: ManageSubscriptionDeps,
  input: {
    code: "BASIC" | "PREMIUM";
    actor: Actor;
    monthlyPrice?: string;
    maxSimultaneousSets?: number;
    queueBonusDays?: number;
  }
): Promise<PlanConfig> {
  if (!can(input.actor.role, "settings.manage")) {
    throw new ForbiddenError("Solo un administrador puede configurar los planes.");
  }

  const current = (await subscriptions.listPlans()).find((plan) => plan.code === input.code);
  if (!current) throw new NotFoundError("El plan no existe.");
  // Copia, no referencia: si el repositorio actualizara el plan mutando el mismo
  // objeto, la auditoría registraría el valor nuevo como si fuera el anterior.
  const before = { ...current };

  if (input.maxSimultaneousSets !== undefined && input.maxSimultaneousSets < 1) {
    // Un plan con cero sets no es un plan: sería vender una suscripción inservible.
    throw new ValidationError([
      { field: "maxSimultaneousSets", issue: "El plan debe permitir al menos un set." },
    ]);
  }

  const updated = await subscriptions.updatePlan(input.code, {
    monthlyPrice: input.monthlyPrice,
    maxSimultaneousSets: input.maxSimultaneousSets,
    queueBonusDays: input.queueBonusDays,
  });
  if (!updated) throw new NotFoundError("El plan no existe.");

  await audit.record({
    actorId: input.actor.id,
    action: "plan.updated",
    entityType: "Plan",
    // El id, no el código: `AuditLog.entityId` es una columna UUID y un "PREMIUM"
    // revienta la inserción. El código queda igualmente en el `metadata`.
    entityId: updated.id,
    metadata: { before, after: updated },
    at: now(),
  });

  return updated;
}
