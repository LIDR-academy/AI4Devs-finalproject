import { hashPassword } from "@/domain/auth/password";
import { ValidationError } from "@/domain/errors";
import type { SubscriberRepository } from "@/repositories/subscriber.repository";

import { normalizeEmail } from "../auth/login";

export interface RegisterSubscriberDeps {
  repository: SubscriberRepository;
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
}

export interface RegisterSubscriberResult {
  userId: string;
}

/**
 * Alta de suscriptor (spec `accounts-roles`).
 *
 * Las tres condiciones del alta —ser adulto, aceptar las condiciones y aportar
 * dirección de envío— se comprueban **aquí** y no solo con el esquema del borde: son
 * requisitos de negocio, no de formato, y este caso de uso tiene que rechazarlos
 * venga de donde venga la llamada.
 */
export async function registerSubscriber(
  { repository, now = () => new Date() }: RegisterSubscriberDeps,
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
  if (issues.length > 0) throw new ValidationError(issues);

  const result = await repository.createSubscriber({
    email: normalizeEmail(input.email),
    passwordHash: await hashPassword(input.password),
    fullName: input.fullName.trim(),
    acceptedTermsAt: now(),
    address: {
      line1: input.address.line1.trim(),
      city: input.address.city.trim(),
      postalCode: input.address.postalCode.trim(),
      country: input.address.country?.trim() || "ES",
    },
    card: input.card,
  });

  if (result.outcome === "email_taken") {
    // Se admite que esto revela qué emails están dados de alta. En un alta es
    // inevitable sin sacrificar la usabilidad, y a diferencia del login —donde sí se
    // evita (ver `login.ts`)— aquí no hay credencial que proteger.
    throw new ValidationError([
      { field: "email", issue: "Ya existe una cuenta con este email." },
    ]);
  }

  return { userId: result.userId };
}
