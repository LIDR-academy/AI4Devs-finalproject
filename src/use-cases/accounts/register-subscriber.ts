import { hashPassword, verifyPassword } from "@/domain/auth/password";
import { ValidationError } from "@/domain/errors";
import type { AuthRepository } from "@/repositories/auth.repository";
import type { SubscriberRepository } from "@/repositories/subscriber.repository";
import type { SubscriptionRepository } from "@/repositories/subscription.repository";

import { normalizeEmail } from "../auth/login";

export interface RegisterSubscriberDeps {
  repository: SubscriberRepository;
  /**
   * Puerto de suscripciones. El alta **orquesta, no reimplementa**: qué planes existen
   * y cuáles se pueden contratar lo sigue decidiendo la capability `subscriptions`, y
   * aquí solo se consulta para traducir el código elegido a su plan.
   */
  subscriptions: SubscriptionRepository;
  /**
   * Solo para el caso de la vuelta: comprobar la contraseña de una cuenta que ya
   * existe. El alta normal no lo usa.
   */
  auth: AuthRepository;
  now?: () => Date;
}

export interface RegisterSubscriberInput {
  email: string;
  password: string;
  fullName: string;
  /** Declaración de mayoría de edad (PRD §4.1). */
  isAdult: boolean;
  /** Aceptación de las condiciones (texto lorem ipsum en el MVP). */
  acceptsTerms: boolean;
  address: { line1: string; city: string; postalCode: string; country?: string };
  card: { brand: string; last4: string; expMonth: number; expYear: number };
  /** Plan elegido (`BASIC` / `PREMIUM`). Sin plan no hay alta. */
  planCode: string;
}

export interface RegisterSubscriberResult {
  userId: string;
  /** Plan con el que queda suscrito; el alta ya deja la cuenta operativa. */
  planCode: string;
  /** `true` cuando lo que se hizo fue reabrir la suscripción de una cuenta existente. */
  resubscribed: boolean;
}

/**
 * Alta de suscriptor (spec `accounts-roles`).
 *
 * Las cuatro condiciones del alta —ser adulto, aceptar las condiciones, aportar
 * dirección de envío y elegir plan— se comprueban **aquí** y no solo con el esquema
 * del borde: son requisitos de negocio, no de formato, y este caso de uso tiene que
 * rechazarlos venga de donde venga la llamada.
 */
export async function registerSubscriber(
  { repository, subscriptions, auth, now = () => new Date() }: RegisterSubscriberDeps,
  input: RegisterSubscriberInput
): Promise<RegisterSubscriberResult> {
  const issues = [];

  if (!input.isAdult) {
    issues.push({ field: "isAdult", issue: "Debes declarar que eres mayor de edad." });
  }
  if (!input.acceptsTerms) {
    issues.push({ field: "acceptsTerms", issue: "Debes aceptar las condiciones." });
  }
  // La spec es explícita: sin dirección de envío el alta se rechaza hasta completarla.
  if (!input.address?.line1?.trim()) {
    issues.push({ field: "address.line1", issue: "La dirección de envío es obligatoria." });
  }

  // El plan se valida como **un error más del formulario** (design.md §1), no con un
  // 404 aparte: quien rellena el alta merece ver de una vez todo lo que le falta.
  const plan = (await subscriptions.listPlans()).find(
    (candidate) => candidate.code === input.planCode && candidate.active
  );
  if (!plan) {
    issues.push({
      field: "planCode",
      issue: input.planCode?.trim()
        ? "El plan elegido no está disponible."
        : "Debes elegir un plan de suscripción.",
    });
    // Sin plan no hay nada que crear, y `issues` ya lleva acumulado el resto.
    throw new ValidationError(issues);
  }

  if (issues.length > 0) throw new ValidationError(issues);

  const startedAt = now();
  const result = await repository.createSubscriber({
    email: normalizeEmail(input.email),
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    acceptedTermsAt: startedAt,
    address: {
      line1: input.address.line1.trim(),
      city: input.address.city.trim(),
      postalCode: input.address.postalCode.trim(),
      country: input.address.country?.trim() || "ES",
    },
    card: input.card,
    subscription: { planId: plan.id, startedAt },
  });

  if (result.outcome === "email_taken") {
    return resubscribeExisting({ repository, auth }, input, plan.id, plan.code, startedAt);
  }

  return { userId: result.userId, planCode: plan.code, resubscribed: false };
}

/**
 * La vuelta de un cliente que canceló.
 *
 * Cancelar dejaba un callejón sin salida: la suscripción cancelada ya no rige, así que
 * no hay nada que reactivar desde el portal, y el alta rebotaba con "ya existe una
 * cuenta con este email". El cliente se quedaba fuera con su propia cuenta.
 *
 * **La contraseña es la que abre la puerta.** Con ella acreditada se reabre la
 * suscripción sobre la cuenta de siempre —con el nombre, la dirección y la tarjeta que
 * traiga el formulario nuevo—, y sin ella la respuesta es exactamente la de antes: no
 * se revela nada que el alta no revelara ya. Lo que sí añade es un sitio más donde
 * probar contraseñas, igual que el login: cuando haya limitación de intentos, tiene
 * que cubrir los dos.
 */
async function resubscribeExisting(
  { repository, auth }: Pick<RegisterSubscriberDeps, "repository" | "auth">,
  input: RegisterSubscriberInput,
  planId: string,
  planCode: string,
  startedAt: Date
): Promise<RegisterSubscriberResult> {
  const emailTaken = () =>
    new ValidationError([
      {
        field: "email",
        issue:
          "Ya existe una cuenta con este email. Si es tuya, escribe su contraseña para volver a suscribirte.",
      },
    ]);

  const account = await auth.findUserByEmail(normalizeEmail(input.email));
  if (!account || !(await verifyPassword(account.passwordHash, input.password))) {
    throw emailTaken();
  }

  // Estas dos sí se distinguen, pero **solo después** de acreditar la identidad — el
  // mismo criterio que el login con una cuenta suspendida (`login.ts`).
  if (account.role !== "SUBSCRIBER") {
    throw new ValidationError([
      { field: "email", issue: "Esta cuenta es del equipo de Clickoteca, no de suscriptor." },
    ]);
  }
  if (account.status === "SUSPENDED") {
    throw new ValidationError([
      { field: "email", issue: "Esta cuenta está suspendida y no puede contratar un plan." },
    ]);
  }

  const outcome = await repository.resubscribe({
    userId: account.id,
    fullName: input.fullName.trim(),
    acceptedTermsAt: startedAt,
    address: {
      line1: input.address.line1.trim(),
      city: input.address.city.trim(),
      postalCode: input.address.postalCode.trim(),
      country: input.address.country?.trim() || "ES",
    },
    card: input.card,
    subscription: { planId, startedAt },
  });

  if (outcome.outcome === "already_subscribed") {
    throw new ValidationError([
      {
        field: "email",
        issue: "Esta cuenta ya tiene una suscripción en marcha; entra en tu portal para gestionarla.",
      },
    ]);
  }
  // La cuenta existía hace un instante y ya no: es una carrera rarísima, y la respuesta
  // honesta es la misma que si el email estuviera cogido.
  if (outcome.outcome === "not_found") throw emailTaken();

  return { userId: account.id, planCode, resubscribed: true };
}
