import type { CopyState } from "@/domain/copy/lifecycle";

/** Puerto de suscripciones y de la situación de alquiler de un usuario. */

export interface ActiveSubscription {
  id: string;
  userId: string;
  planCode: "BASIC" | "PREMIUM";
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  startedAt: Date;
  maxSimultaneousSets: number;
  /** Días de ventaja en la cola que otorga el plan (D4). */
  queueBonusDays: number;
}

export interface PlanConfig {
  /** UUID. Necesario para la auditoría, cuyo `entityId` es una columna UUID. */
  id: string;
  code: "BASIC" | "PREMIUM";
  name: string;
  monthlyPrice: string;
  maxSimultaneousSets: number;
  queueBonusDays: number;
  active: boolean;
}

export interface SubscriptionRepository {
  /** Suscripción vigente del usuario, o `null` si nunca tuvo o ya canceló. */
  findCurrentSubscription(userId: string): Promise<ActiveSubscription | null>;

  /**
   * Estados de las copias que el usuario tiene asignadas ahora mismo. Es lo que
   * necesita la elegibilidad: no hace falta el alquiler entero, solo si ocupa plaza.
   */
  currentCopyStates(userId: string): Promise<readonly CopyState[]>;

  /**
   * Abre una suscripción **nueva** para quien no tiene ninguna vigente: la vuelta de
   * quien canceló, ya identificado por su sesión.
   *
   * Devuelve `null` si resulta que sí tenía una — y la comprobación va **dentro de la
   * transacción**, no antes: entre consultarla y escribir cabe otra petición idéntica,
   * y el resultado serían dos suscripciones sobre la misma cuenta. Es la misma cautela
   * que ya toma `SubscriberRepository.resubscribe` para el alta pública.
   */
  openSubscription(input: {
    userId: string;
    planId: string;
    startedAt: Date;
  }): Promise<ActiveSubscription | null>;

  updateStatus(
    subscriptionId: string,
    status: "ACTIVE" | "PAUSED" | "CANCELLED",
    at: Date
  ): Promise<ActiveSubscription | null>;

  /**
   * Mueve la suscripción a otro plan. Devuelve `null` si ya no existe.
   *
   * No toca las entradas de cola: `appliedBonus` y `effectiveEntryAt` se congelan al
   * encolar (D11), así que cambiar de plan no reordena ninguna cola en curso.
   */
  changePlan(subscriptionId: string, planId: string): Promise<ActiveSubscription | null>;

  listPlans(): Promise<readonly PlanConfig[]>;

  updatePlan(
    code: "BASIC" | "PREMIUM",
    input: { monthlyPrice?: string; maxSimultaneousSets?: number; queueBonusDays?: number }
  ): Promise<PlanConfig | null>;
}
