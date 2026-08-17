import { describe, expect, it } from "vitest";

import { verifyPassword } from "@/domain/auth/password";
import { ValidationError } from "@/domain/errors";
import type {
  CreateSubscriberOutcome,
  NewSubscriber,
  SubscriberRepository,
} from "@/repositories/subscriber.repository";
import { isUniqueEmailViolation } from "@/repositories/subscriber.repository.prisma";
import type {
  PlanConfig,
  SubscriptionRepository,
} from "@/repositories/subscription.repository";
import { registerSubscriber } from "@/use-cases/accounts/register-subscriber";

const PLANS: PlanConfig[] = [
  { id: "plan-basic-uuid", code: "BASIC", name: "Basic", monthlyPrice: "14.99", maxSimultaneousSets: 1, queueBonusDays: 0, active: true },
  { id: "plan-premium-uuid", code: "PREMIUM", name: "Premium", monthlyPrice: "24.99", maxSimultaneousSets: 2, queueBonusDays: 10, active: true },
];

/** Puerto de suscripciones reducido a lo que el alta necesita: listar planes. */
function fakeSubscriptions(plans: PlanConfig[] = PLANS): SubscriptionRepository {
  return {
    async findCurrentSubscription() { return null; },
    async currentCopyStates() { return []; },
    async updateStatus() { return null; },
    async updatePlan() { return null; },
    async changePlan() { return null; },
    async listPlans() { return plans; },
  };
}

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
  planCode: "PREMIUM",
};

/** Recoge el `ValidationError` de un alta que debe fallar. */
async function failedRegistration(
  repository: SubscriberRepository,
  input: Parameters<typeof registerSubscriber>[1],
  subscriptions: SubscriptionRepository = fakeSubscriptions()
) {
  try {
    await registerSubscriber({ repository, subscriptions }, input);
    throw new Error("Se esperaba que el alta fallara.");
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    return error as ValidationError;
  }
}

describe("alta de suscriptor", () => {
  it("crea la cuenta normalizando email y recortando espacios", async () => {
    const { repository, created } = fakeRepository();
    const result = await registerSubscriber({ repository, subscriptions: fakeSubscriptions() }, VALID);

    expect(result).toEqual({ userId: "user-1", planCode: "PREMIUM" });
    expect(created[0]).toMatchObject({
      email: "nueva@example.test",
      fullName: "Nuria Ejemplo",
      address: { line1: "Calle Falsa 123", city: "Sevilla", postalCode: "41001", country: "ES" },
    });
  });

  it("guarda la contraseña hasheada, nunca en claro", async () => {
    const { repository, created } = fakeRepository();
    await registerSubscriber({ repository, subscriptions: fakeSubscriptions() }, VALID);

    expect(created[0].passwordHash).not.toContain(VALID.password);
    expect(await verifyPassword(created[0].passwordHash, VALID.password)).toBe(true);
  });

  it("deja constancia del instante en que se aceptaron las condiciones", async () => {
    const { repository, created } = fakeRepository();
    const at = new Date("2026-06-01T08:00:00.000Z");
    await registerSubscriber(
      { repository, subscriptions: fakeSubscriptions(), now: () => at },
      VALID
    );

    // Mostrar las condiciones sin registrar la aceptación no probaría nada.
    expect(created[0].acceptedTermsAt).toEqual(at);
  });

  it("no pide ni propaga el número completo de la tarjeta", async () => {
    const { repository, created } = fakeRepository();
    await registerSubscriber({ repository, subscriptions: fakeSubscriptions() }, VALID);

    expect(created[0].card).toEqual({ brand: "VISA", last4: "4242", expMonth: 12, expYear: 2030 });
    expect(JSON.stringify(created[0].card)).not.toMatch(/\d{13,}/);
  });

  it("contrata el plan elegido en la misma llamada que crea la cuenta", async () => {
    const { repository, created } = fakeRepository();
    const at = new Date("2026-06-01T08:00:00.000Z");
    await registerSubscriber(
      { repository, subscriptions: fakeSubscriptions(), now: () => at },
      VALID
    );

    // El código del plan se resuelve a su id aquí: el adaptador no vuelve a decidir
    // qué planes son contratables, solo escribe.
    expect(created[0].subscription).toEqual({ planId: "plan-premium-uuid", startedAt: at });
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("rechaza el alta sin plan, junto al resto de errores del formulario", async () => {
    const { repository, created } = fakeRepository();
    const error = await failedRegistration(repository, {
      ...VALID,
      planCode: "",
      isAdult: false,
    });

    // El plan es un error más del formulario, no un 404 aparte: se ve de una vez con
    // todo lo que falta.
    expect(error.issues.map((i) => i.field).sort()).toEqual(["isAdult", "planCode"]);
    expect(created).toHaveLength(0);
  });

  it("rechaza un plan que no existe", async () => {
    const { repository, created } = fakeRepository();
    const error = await failedRegistration(repository, { ...VALID, planCode: "ORO" });

    expect(error.issues).toContainEqual({
      field: "planCode",
      issue: "El plan elegido no está disponible.",
    });
    expect(created).toHaveLength(0);
  });

  it("rechaza un plan que existe pero ya no se ofrece", async () => {
    const { repository, created } = fakeRepository();
    const retired = PLANS.map((plan) =>
      plan.code === "PREMIUM" ? { ...plan, active: false } : plan
    );
    const error = await failedRegistration(repository, VALID, fakeSubscriptions(retired));

    expect(error.issues.map((i) => i.field)).toEqual(["planCode"]);
    expect(created).toHaveLength(0);
  });

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

describe("atomicidad del alta", () => {
  /**
   * Repositorio que **emula la transacción**: solo publica lo que ha creado si llegan
   * a existir las cuatro filas. Sin este doble, un fallo al crear la suscripción
   * pasaría inadvertido y dejaría una cuenta que no puede alquilar — el estado que
   * este cambio elimina.
   */
  class TransactionalFakeRepository implements SubscriberRepository {
    readonly users: Array<{ id: string; planId: string }> = [];

    constructor(private readonly failOnPlanId: string | null = null) {}

    async createSubscriber(input: NewSubscriber) {
      const pending = { id: "user-1", planId: input.subscription.planId };
      if (this.failOnPlanId === input.subscription.planId) {
        // Rollback: la fila del usuario nunca llega a publicarse.
        throw new Error("fallo al crear la suscripción");
      }
      this.users.push(pending);
      return { outcome: "created" as const, userId: pending.id };
    }
  }

  it("un fallo al crear la suscripción no deja cuenta huérfana", async () => {
    const repository = new TransactionalFakeRepository("plan-premium-uuid");

    await expect(
      registerSubscriber({ repository, subscriptions: fakeSubscriptions() }, VALID)
    ).rejects.toThrow("fallo al crear la suscripción");

    expect(repository.users).toHaveLength(0);
  });

  it("el alta correcta deja cuenta y suscripción", async () => {
    const repository = new TransactionalFakeRepository();
    await registerSubscriber({ repository, subscriptions: fakeSubscriptions() }, VALID);

    expect(repository.users).toEqual([{ id: "user-1", planId: "plan-premium-uuid" }]);
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
