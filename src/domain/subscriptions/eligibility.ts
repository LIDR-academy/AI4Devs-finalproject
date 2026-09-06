import type { CopyState } from "@/domain/copy/lifecycle";

/**
 * Elegibilidad de un suscriptor para llevarse un set (spec `subscriptions`).
 *
 * Lógica pura: entra el estado del suscriptor y sale un veredicto. La usan tanto la
 * solicitud directa como el recorrido de la cola al ofrecer (D5), que necesita saltar
 * a quien no sea elegible **en ese momento**.
 */

/**
 * Estados de copia que **siguen ocupando** una plaza del plan.
 *
 * La devolución no libera plaza al iniciarse, sino cuando la copia vuelve a
 * `DISPONIBLE`: mientras está en tránsito, inspección o higienización sigue contando.
 * Es exactamente lo que pide la spec, y de paso hace que la regla "no hay set nuevo
 * hasta completar la devolución" no necesite ninguna comprobación aparte — se cae del
 * propio límite de plan.
 */
export const OCCUPYING_COPY_STATES = [
  "ALQUILADA",
  "EN_DEVOLUCION",
  "EN_INSPECCION",
  "EN_HIGIENIZACION",
] as const satisfies readonly CopyState[];

export function occupiesPlanSlot(state: CopyState): boolean {
  return (OCCUPYING_COPY_STATES as readonly CopyState[]).includes(state);
}

/**
 * Estados en los que la copia está **físicamente con el suscriptor** (o de camino de
 * vuelta). Es un conjunto más estrecho que el anterior: una copia en inspección ya
 * está en nuestras manos, aunque siga ocupando plaza.
 */
export const HELD_COPY_STATES = ["ALQUILADA", "EN_DEVOLUCION"] as const satisfies readonly CopyState[];

export function isHeldBySubscriber(state: CopyState): boolean {
  return (HELD_COPY_STATES as readonly CopyState[]).includes(state);
}

export type IneligibilityReason =
  | "NO_ACTIVE_SUBSCRIPTION"
  | "PLAN_LIMIT_REACHED"
  | "RETURN_IN_PROGRESS"
  | "SUBSCRIPTION_TOO_RECENT";

export type Eligibility =
  | { eligible: true }
  | {
      eligible: false;
      reason: IneligibilityReason;
      detail: string;
      /**
       * Desde cuándo dejará de aplicar el motivo. Solo lo lleva
       * `SUBSCRIPTION_TOO_RECENT`, que es el único que se resuelve **solo con
       * esperar**: los otros tres dependen de una acción —contratar, devolver, o que
       * termine una inspección— y no tienen fecha que prometer.
       *
       * Va como `Date` y no como frase: el formato es de la capa que pinta, que ya
       * tiene sus `Intl`. Así el mismo cálculo sirve para la ficha y para la API.
       */
      availableFrom?: Date;
    };

export interface EligibilityInput {
  subscription: {
    status: "ACTIVE" | "PAUSED" | "CANCELLED";
    startedAt: Date;
    maxSimultaneousSets: number;
  } | null;
  /** Estados de las copias que el suscriptor tiene ahora mismo asignadas. */
  currentCopyStates: readonly CopyState[];
  /** El set que quiere llevarse. */
  set: { restricted: boolean };
  restrictedSetMinMonths: number;
  now: Date;
}

/** Meses completos transcurridos entre dos fechas. */
export function monthsBetween(from: Date, to: Date): number {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  // Si aún no se ha alcanzado el día del mes, el mes no está completo.
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Primer instante en que una suscripción iniciada en `startedAt` alcanza
 * `minMonths` de antigüedad.
 *
 * Es la **inversa exacta** de `monthsBetween`, y por eso no es "sumar meses" a secas.
 * Dos trampas, las dos encontradas por el barrido del test y ninguna leyendo el código:
 *
 *  1. **El día que no existe en el mes de destino.** Con un alta el **30 de enero** y
 *     un mes, el 30 de febrero no existe. `setMonth` desborda al **2 de marzo**, pero
 *     `monthsBetween` ya da el mes por completo el **1 de marzo** —el día 1 es menor
 *     que el 30, sí, pero han pasado dos meses de calendario—. Sumar y dejar que
 *     desborde llegaba un día tarde. Cuando el día no cabe, la respuesta es el **día 1
 *     del mes siguiente**.
 *  2. **La hora.** `monthsBetween` compara año, mes y día e **ignora la hora**, así que
 *     quien se suscribió a mediodía cumple a las 00:00 de ese día. Conservar la hora
 *     del alta hacía esperar medio día de más.
 */
export function restrictedAvailableFrom(startedAt: Date, minMonths: number): Date {
  const month = startedAt.getMonth() + minMonths;
  const day = startedAt.getDate();

  // `new Date(y, m, d)` normaliza sola: un 30 de febrero cae en marzo. Que el día
  // resultante no sea el pedido es justo la señal de que el día no cabía.
  const target = new Date(startedAt.getFullYear(), month, day);
  if (target.getDate() !== day) {
    return new Date(startedAt.getFullYear(), month + 1, 1);
  }
  return target;
}

export function checkEligibility(input: EligibilityInput): Eligibility {
  const { subscription } = input;

  if (!subscription || subscription.status !== "ACTIVE") {
    return {
      eligible: false,
      reason: "NO_ACTIVE_SUBSCRIPTION",
      detail: "Necesitas una suscripción activa para llevarte un set.",
    };
  }

  const occupied = input.currentCopyStates.filter(occupiesPlanSlot);
  if (occupied.length >= subscription.maxSimultaneousSets) {
    // Se distingue si el tope está copado por sets en casa o por una devolución sin
    // terminar: la acción que resuelve cada caso es distinta —devolver, o esperar—, y
    // un mensaje genérico dejaría al suscriptor sin saber qué hacer.
    //
    // Solo `ALQUILADA` significa "lo tienes en casa"; cualquier otro estado que ocupe
    // plaza es una devolución ya iniciada, aunque la copia siga en tránsito.
    const returning = occupied.some((state) => state !== "ALQUILADA");
    return returning
      ? {
          eligible: false,
          reason: "RETURN_IN_PROGRESS",
          detail:
            "Tu devolución anterior aún no está completada. La plaza se libera cuando la copia vuelve a estar disponible.",
        }
      : {
          eligible: false,
          reason: "PLAN_LIMIT_REACHED",
          detail: `Tu plan permite ${subscription.maxSimultaneousSets} set(s) a la vez. Devuelve uno para pedir otro.`,
        };
  }

  if (input.set.restricted) {
    const months = monthsBetween(subscription.startedAt, input.now);
    if (months < input.restrictedSetMinMonths) {
      return {
        eligible: false,
        reason: "SUBSCRIPTION_TOO_RECENT",
        detail: `Este set requiere ${input.restrictedSetMinMonths} meses de antigüedad de suscripción; llevas ${months}.`,
        availableFrom: restrictedAvailableFrom(
          subscription.startedAt,
          input.restrictedSetMinMonths
        ),
      };
    }
  }

  return { eligible: true };
}

export type PlanChangeVerdict =
  | { allowed: true }
  /** Cuántos sets tiene que devolver antes de que el plan nuevo le quepa. */
  | { allowed: false; mustReturn: number; detail: string };

/**
 * ¿Le cabe al suscriptor lo que ya ocupa dentro del plan al que quiere cambiar?
 *
 * No es una comprobación paralela a la elegibilidad: es **el mismo límite de plazas**
 * medido contra el `maxSimultaneousSets` del plan destino, con el mismo conjunto de
 * estados (`OCCUPYING_COPY_STATES`). Así no puede desincronizarse de la regla que
 * decide si puede llevarse un set más.
 *
 * Vale igual para subir y para bajar —una subida nunca reduce el límite, así que pasa
 * sola— y por eso no hay ninguna bifurcación por dirección del cambio.
 *
 * Se usa el conjunto ancho y **no** `HELD_COPY_STATES` (el de pausar/cancelar): allí lo
 * que importa es si el suscriptor ya cumplió su parte devolviendo; aquí, cuántas plazas
 * está ocupando. Con el conjunto estrecho, un `BASIC` podría acabar por encima de su
 * propio límite con una copia en casa y otra en inspección.
 */
export function canSwitchToPlan(
  currentCopyStates: readonly CopyState[],
  targetMaxSimultaneousSets: number
): PlanChangeVerdict {
  const occupied = currentCopyStates.filter(occupiesPlanSlot).length;
  if (occupied <= targetMaxSimultaneousSets) return { allowed: true };

  // Un número es accionable; "tienes sets pendientes" no dice cuántos ni cuándo acaba.
  const mustReturn = occupied - targetMaxSimultaneousSets;
  return {
    allowed: false,
    mustReturn,
    detail:
      mustReturn === 1
        ? "Ese plan permite menos sets de los que tienes ahora. Devuelve 1 set para poder cambiarte."
        : `Ese plan permite menos sets de los que tienes ahora. Devuelve ${mustReturn} sets para poder cambiarte.`,
  };
}

/**
 * ¿Puede pausar o cancelar la suscripción?
 *
 * Solo se bloquea por las copias que están **en su poder** (o de vuelta en tránsito),
 * no por las que ya hemos recibido: si la copia está en inspección, el suscriptor ya
 * cumplió con devolverla y retenerle la suscripción por nuestro proceso interno sería
 * injusto.
 */
export function canEndSubscription(currentCopyStates: readonly CopyState[]): Eligibility {
  const held = currentCopyStates.filter(isHeldBySubscriber);
  if (held.length === 0) return { eligible: true };

  return {
    eligible: false,
    reason: "RETURN_IN_PROGRESS",
    detail:
      held.length === 1
        ? "Tienes un set sin devolver. La devolución es obligatoria antes de pausar o cancelar."
        : `Tienes ${held.length} sets sin devolver. La devolución es obligatoria antes de pausar o cancelar.`,
  };
}
