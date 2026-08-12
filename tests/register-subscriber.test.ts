import { describe, expect, it } from "vitest";

import { verifyPassword } from "@/domain/auth/password";
import { ValidationError } from "@/domain/errors";
import type {
  CreateSubscriberOutcome,
  NewSubscriber,
  SubscriberRepository,
} from "@/repositories/subscriber.repository";
import { isUniqueEmailViolation } from "@/repositories/subscriber.repository.prisma";
import { registerSubscriber } from "@/use-cases/accounts/register-subscriber";

function fakeRepository(outcome: CreateSubscriberOutcome = { outcome: "created", userId: "user-1" }) {
  const created: NewSubscriber[] = [];
  const repository: SubscriberRepository = {
    async createSubscriber(input) {
      created.push(input);
      return outcome;
    },
  };
  return { repository, created };
}

const VALID = {
  email: "  Nueva@Example.TEST ",
  password: "contraseña-larga",
  fullName: "  Nuria Ejemplo  ",
  isAdult: true,
  acceptsTerms: true,
  address: { line1: "  Calle Falsa 123  ", city: " Sevilla ", postalCode: " 41001 " },
  card: { brand: "VISA", last4: "4242", expMonth: 12, expYear: 2030 },
};

/** Recoge el `ValidationError` de un alta que debe fallar. */
async function failedRegistration(
  repository: SubscriberRepository,
  input: Parameters<typeof registerSubscriber>[1]
) {
  try {
    await registerSubscriber({ repository }, input);
    throw new Error("Se esperaba que el alta fallara.");
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return error as ValidationError;
  }
}

describe("alta de suscriptor", () => {
  it("crea la cuenta normalizando email y recortando espacios", async () => {
    const { repository, created } = fakeRepository();
    const result = await registerSubscriber({ repository }, VALID);

    expect(result).toEqual({ userId: "user-1" });
    expect(created[0]).toMatchObject({
      email: "nueva@example.test",
      fullName: "Nuria Ejemplo",
      address: { line1: "Calle Falsa 123", city: "Sevilla", postalCode: "41001", country: "ES" },
    });
  });

  it("guarda la contraseña hasheada, nunca en claro", async () => {
    const { repository, created } = fakeRepository();
    await registerSubscriber({ repository }, VALID);

    expect(created[0].passwordHash).not.toContain(VALID.password);
    expect(await verifyPassword(created[0].passwordHash, VALID.password)).toBe(true);
  });

  it("deja constancia del instante en que se aceptaron las condiciones", async () => {
    const { repository, created } = fakeRepository();
    const at = new Date("2026-06-01T08:00:00.000Z");
    await registerSubscriber({ repository, now: () => at }, VALID);

    // Mostrar las condiciones sin registrar la aceptación no probaría nada.
    expect(created[0].acceptedTermsAt).toEqual(at);
  });

  it("no pide ni propaga el número completo de la tarjeta", async () => {
    const { repository, created } = fakeRepository();
    await registerSubscriber({ repository }, VALID);

    expect(created[0].card).toEqual({ brand: "VISA", last4: "4242", expMonth: 12, expYear: 2030 });
    expect(JSON.stringify(created[0].card)).not.toMatch(/\d{13,}/);
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("rechaza el alta sin dirección de envío", async () => {
    const { repository, created } = fakeRepository();
    const error = await failedRegistration(repository, {
      ...VALID,
      address: { ...VALID.address, line1: "   " },
    });

    expect(error.issues).toContainEqual({
      field: "address.line1",
      issue: "La dirección de envío es obligatoria.",
    });
    // Y no se llega a crear nada.
    expect(created).toHaveLength(0);
  });

  it("rechaza el alta si no se declara la mayoría de edad", async () => {
    const { repository, created } = fakeRepository();
    const error = await failedRegistration(repository, { ...VALID, isAdult: false });

    expect(error.issues.map((i) => i.field)).toContain("isAdult");
    expect(created).toHaveLength(0);
  });

  it("rechaza el alta si no se aceptan las condiciones", async () => {
    const { repository, created } = fakeRepository();
    const error = await failedRegistration(repository, { ...VALID, acceptsTerms: false });

    expect(error.issues.map((i) => i.field)).toContain("acceptsTerms");
    expect(created).toHaveLength(0);
  });

  it("acumula todos los requisitos que faltan, no solo el primero", async () => {
    const { repository } = fakeRepository();
    const error = await failedRegistration(repository, {
      ...VALID,
      isAdult: false,
      acceptsTerms: false,
      address: { ...VALID.address, line1: "" },
    });

    // Quien rellena el formulario merece verlo todo de una vez.
    expect(error.issues.map((i) => i.field).sort()).toEqual([
      "acceptsTerms",
      "address.line1",
      "isAdult",
    ]);
  });

  it("informa del email ya registrado como error del campo email", async () => {
    const { repository } = fakeRepository({ outcome: "email_taken" });
    const error = await failedRegistration(repository, VALID);

    expect(error.issues).toEqual([
      { field: "email", issue: "Ya existe una cuenta con este email." },
    ]);
  });
});

describe("detección del email duplicado en el adaptador Prisma", () => {
  it("reconoce el P2002 con `meta.target` (cliente clásico)", () => {
    expect(isUniqueEmailViolation({ code: "P2002", meta: { target: ["email"] } })).toBe(true);
    expect(isUniqueEmailViolation({ code: "P2002", meta: { target: "users_email_key" } })).toBe(true);
  });

  it("reconoce el P2002 sin `meta.target` (driver adapter de Prisma 7)", () => {
    // El adaptador no informa del campo; el único índice único que puede violar la
    // inserción de un User es el del email.
    expect(
      isUniqueEmailViolation({ code: "P2002", meta: { modelName: "User" } })
    ).toBe(true);
  });

  it("no confunde otros errores con un email duplicado", () => {
    expect(isUniqueEmailViolation({ code: "P2002", meta: { target: ["tokenHash"] } })).toBe(false);
    expect(isUniqueEmailViolation({ code: "P2002", meta: { modelName: "Session" } })).toBe(false);
    expect(isUniqueEmailViolation({ code: "P2025", meta: { modelName: "User" } })).toBe(false);
    expect(isUniqueEmailViolation(new Error("cualquier cosa"))).toBe(false);
    expect(isUniqueEmailViolation(null)).toBe(false);
  });
});
