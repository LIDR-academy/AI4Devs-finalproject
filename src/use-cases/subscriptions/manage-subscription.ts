import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { canEndSubscription, canSwitchToPlan } from "@/domain/subscriptions/eligibility";
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
 * Contrata un plan para quien **no tiene ninguna suscripción vigente**: la vuelta de
 * quien canceló, ya identificado por su sesión.
 *
 * Existía el camino equivalente en el alta pública —volver a suscribirse acreditando la
 * contraseña (spec `accounts-roles`)—, pero solo servía **sin sesión**: dentro, la
 * página de alta redirige al portal, así que quien había cancelado daba vueltas entre
 * "ver los planes" y su portal sin ninguna salida.
 *
 * Aquí no hace falta contraseña: la sesión ya acredita quién es. Y no se "reactiva" la
 * cancelada —una suscripción cancelada ya no rige, y así lo dice la spec—, se abre una
 * nueva sobre la misma cuenta, conservando la dirección de envío y la tarjeta que ya
 * tenía. El día que quiera cambiarlas, son datos suyos, no de la suscripción.
 */
export async function openSubscription(
  { subscriptions, audit, now = () => new Date() }: ManageSubscriptionDeps,
  input: { userId: string; planCode: string }
): Promise<ActiveSubscription> {
  const target = (await subscriptions.listPlans()).find(
    (plan) => plan.code === input.planCode && plan.active
  );
  if (!target) throw new NotFoundError("El plan no existe o ya no se ofrece.");

  const opened = await subscriptions.openSubscription({
    userId: input.userId,
    planId: target.id,
    startedAt: now(),
  });

  // `null` significa que ya tenía una vigente, y lo decide la transacción del
  // repositorio: comprobarlo aquí antes dejaría hueco a que dos peticiones a la vez
  // abrieran dos suscripciones. Quien ya tiene una lo que quiere es cambiar de plan.
  if (!opened) {
    throw new InvariantViolationError(
      "NOT_ELIGIBLE",
      "Ya tienes una suscripción vigente. Cambia de plan desde tu suscripción."
    );
  }

  await audit.record({
    actorId: input.userId,
    action: "subscription.opened",
    entityType: "Subscription",
    entityId: opened.id,
    metadata: { planCode: opened.planCode },
    at: now(),
  });

  return opened;
}

/**
 * Cambia de plan la suscripción del propio usuario (spec `subscriptions` → "Cambio de
 * plan").
 *
 * Subir es inmediato. Bajar se rechaza mientras ocupe más plazas de las que permite el
 * plan destino, y no porque exista una comprobación aparte: es el **mismo** límite de
 * plazas medido contra el plan nuevo (`canSwitchToPlan`).
 *
 * Lo que **no** hace, deliberadamente: recalcular las colas. `appliedBonus` se congela
 * al encolar (D11), así que hacerse premium no adelanta una espera ya empezada.
 */
export async function changePlan(
  { subscriptions, audit, now = () => new Date() }: ManageSubscriptionDeps,
  input: { userId: string; planCode: "BASIC" | "PREMIUM" }
): Promise<ActiveSubscription> {
  const subscription = await subscriptions.findCurrentSubscription(input.userId);
  if (!subscription) throw new NotFoundError("No tienes ninguna suscripción activa.");

  // Pedir el plan que ya se tiene no es un error: simplemente no pasa nada, y sobre
  // todo no se escribe una entrada de auditoría de un cambio que no ha ocurrido.
  if (subscription.planCode === input.planCode) return subscription;

  const target = (await subscriptions.listPlans()).find(
    (plan) => plan.code === input.planCode && plan.active
  );
  if (!target) throw new NotFoundError("El plan no existe o ya no se ofrece.");

  const states = await subscriptions.currentCopyStates(input.userId);
  const verdict = canSwitchToPlan(states, target.maxSimultaneousSets);
  if (!verdict.allowed) {
    throw new InvariantViolationError("PLAN_DOWNGRADE_BLOCKED", verdict.detail);
  }

  // Copia, no referencia: si el repositorio actualizara la suscripción mutando el
  // mismo objeto, la auditoría registraría el plan nuevo como si fuera el anterior
  // (trampa ya encontrada al auditar los planes).
  const before = { ...subscription };

  const updated = await subscriptions.changePlan(subscription.id, target.id);
  if (!updated) throw new NotFoundError("No tienes ninguna suscripción activa.");

  await audit.record({
    actorId: input.userId,
    action: "subscription.plan_changed",
    entityType: "Subscription",
    // UUID de la suscripción; el código legible del plan va en `metadata`, porque
    // `AuditLog.entityId` es una columna UUID y un "PREMIUM" revienta la inserción.
    entityId: updated.id,
    metadata: {
      before: { planCode: before.planCode, maxSimultaneousSets: before.maxSimultaneousSets },
      after: { planCode: updated.planCode, maxSimultaneousSets: updated.maxSimultaneousSets },
    },
    at: now(),
  });

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
