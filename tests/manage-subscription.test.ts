import { describe, expect, it } from "vitest";

import type { CopyState } from "@/domain/copy/lifecycle";
import { ForbiddenError, InvariantViolationError, NotFoundError, ValidationError } from "@/domain/errors";
import type {
  ActiveSubscription,
  PlanConfig,
  SubscriptionRepository,
} from "@/repositories/subscription.repository";
import type { RetentionCandidate, RetentionConfig, RetentionRepository } from "@/repositories/retention.repository";
import {
  changeSubscriptionStatus,
  updatePlanConfig,
} from "@/use-cases/subscriptions/manage-subscription";
import { sendRetentionReminders } from "@/use-cases/subscriptions/retention-reminders";

import { FakeAuditRepository } from "./fakes/audit-repository";

const ADMIN = { id: "admin-1", role: "ADMIN" as const };
const OPERATOR = { id: "operator-1", role: "OPERATOR" as const };
const AT = new Date("2026-06-15T10:00:00.000Z");

const PLANS: PlanConfig[] = [
  { id: "plan-basic-uuid", code: "BASIC", name: "Basic", monthlyPrice: "14.99", maxSimultaneousSets: 1, queueBonusDays: 0, active: true },
  { id: "plan-premium-uuid", code: "PREMIUM", name: "Premium", monthlyPrice: "24.99", maxSimultaneousSets: 2, queueBonusDays: 10, active: true },
];

class FakeSubscriptionRepository implements SubscriptionRepository {
  plans = PLANS.map((plan) => ({ ...plan }));

  constructor(
    private subscription: ActiveSubscription | null,
    private states: CopyState[] = []
  ) {}

  async findCurrentSubscription() {
    return this.subscription;
  }
  async currentCopyStates() {
    return this.states;
  }
  async updateStatus(_id: string, status: "ACTIVE" | "PAUSED" | "CANCELLED") {
    if (!this.subscription) return null;
    this.subscription = { ...this.subscription, status };
    return this.subscription;
  }
  async listPlans() {
    return this.plans;
  }
  async updatePlan(code: "BASIC" | "PREMIUM", input: Record<string, unknown>) {
    const plan = this.plans.find((p) => p.code === code);
    if (!plan) return null;
    Object.assign(plan, input);
    return plan;
  }
}

const SUBSCRIPTION: ActiveSubscription = {
  id: "sub-1",
  userId: "user-1",
  planCode: "BASIC",
  status: "ACTIVE",
  startedAt: new Date("2026-01-01T00:00:00.000Z"),
  maxSimultaneousSets: 1,
  queueBonusDays: 0,
};

function deps(subscription: ActiveSubscription | null, states: CopyState[] = []) {
  return {
    subscriptions: new FakeSubscriptionRepository(subscription, states),
    audit: new FakeAuditRepository(),
    now: () => AT,
  };
}

describe("pausar o cancelar la suscripción", () => {
  it("se puede cancelar sin sets fuera", async () => {
    const d = deps(SUBSCRIPTION, []);
    await expect(
      changeSubscriptionStatus(d, { userId: "user-1", status: "CANCELLED" })
    ).resolves.toMatchObject({ status: "CANCELLED" });
  });

  it("se rechaza con una copia sin devolver, y el estado no cambia", async () => {
    const d = deps(SUBSCRIPTION, ["ALQUILADA"]);
    const error = await changeSubscriptionStatus(d, {
      userId: "user-1",
      status: "CANCELLED",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvariantViolationError);
    expect((error as InvariantViolationError).code).toBe("NOT_ELIGIBLE");
    expect((await d.subscriptions.findCurrentSubscription())?.status).toBe("ACTIVE");
  });

  it("tampoco se puede pausar con un set fuera", async () => {
    const d = deps(SUBSCRIPTION, ["EN_DEVOLUCION"]);
    await expect(
      changeSubscriptionStatus(d, { userId: "user-1", status: "PAUSED" })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });

  it("reactivar no exige nada: no es una salida, es una vuelta", async () => {
    const paused = { ...SUBSCRIPTION, status: "PAUSED" as const };
    const d = deps(paused, ["ALQUILADA"]);
    await expect(
      changeSubscriptionStatus(d, { userId: "user-1", status: "ACTIVE" })
    ).resolves.toMatchObject({ status: "ACTIVE" });
  });

  it("404 si no hay suscripción", async () => {
    await expect(
      changeSubscriptionStatus(deps(null), { userId: "user-1", status: "PAUSED" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("configuración de planes (D9)", () => {
  it("el admin cambia el precio y queda auditado con el antes y el después", async () => {
    const d = deps(SUBSCRIPTION);
    const plan = await updatePlanConfig(d, { code: "PREMIUM", actor: ADMIN, monthlyPrice: "27.99" });

    expect(plan.monthlyPrice).toBe("27.99");
    expect(d.audit.entries[0]).toMatchObject({
      action: "plan.updated",
      entityType: "Plan",
      // El id, no el código: `AuditLog.entityId` es una columna UUID.
      entityId: "plan-premium-uuid",
      actorId: "admin-1",
    });
    // Sin el antes/después, la auditoría diría que algo cambió pero no qué.
    const metadata = d.audit.entries[0].metadata as { before: PlanConfig; after: PlanConfig };
    expect(metadata.before.monthlyPrice).toBe("24.99");
    expect(metadata.after.monthlyPrice).toBe("27.99");
  });

  it("el operador no configura planes", async () => {
    const d = deps(SUBSCRIPTION);
    await expect(
      updatePlanConfig(d, { code: "BASIC", actor: OPERATOR, monthlyPrice: "1.00" })
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(d.audit.entries).toHaveLength(0);
  });

  it("rechaza un plan que no permitiría ningún set", async () => {
    const d = deps(SUBSCRIPTION);
    await expect(
      updatePlanConfig(d, { code: "BASIC", actor: ADMIN, maxSimultaneousSets: 0 })
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("permite ajustar el límite de sets y el bono de cola", async () => {
    const d = deps(SUBSCRIPTION);
    const plan = await updatePlanConfig(d, {
      code: "PREMIUM",
      actor: ADMIN,
      maxSimultaneousSets: 3,
      queueBonusDays: 15,
    });
    expect(plan).toMatchObject({ maxSimultaneousSets: 3, queueBonusDays: 15 });
  });
});

describe("envío de recordatorios de retención", () => {
  class FakeRetentionRepository implements RetentionRepository {
    readonly sent: string[] = [];
    failFor: string | null = null;

    constructor(private readonly candidates: RetentionCandidate[]) {}

    async findConfig(): Promise<RetentionConfig | null> {
      return null;
    }
    async upsertConfig(input: { setId: string; enabled: boolean; cadenceDays: number; adminId: string }) {
      return { ...input, activatedByAdminId: input.adminId };
    }
    async findRetentionCandidates() {
      return this.candidates;
    }
    async recordReminderSent({ rentalId }: { rentalId: string }) {
      if (this.failFor === rentalId) throw new Error("fallo simulado");
      this.sent.push(rentalId);
    }
  }

  function candidate(overrides: Partial<RetentionCandidate> = {}): RetentionCandidate {
    return {
      rentalId: "rental-1",
      userId: "user-1",
      setId: "set-1",
      setName: "Millennium Falcon",
      cadenceDays: 7,
      queueLength: 2,
      lastReminderAt: null,
      rentalStartedAt: new Date("2026-06-01T10:00:00.000Z"),
      ...overrides,
    };
  }

  it("envía solo a quien le toca", async () => {
    const retention = new FakeRetentionRepository([
      candidate(),
      candidate({ rentalId: "rental-2", rentalStartedAt: new Date("2026-06-14T10:00:00.000Z") }),
      candidate({ rentalId: "rental-3", queueLength: 0 }),
    ]);

    const result = await sendRetentionReminders({ retention, now: () => AT });

    expect(result).toEqual({ candidates: 3, sent: 1 });
    expect(retention.sent).toEqual(["rental-1"]);
  });

  it("cuenta desde el último recordatorio, no desde el inicio del alquiler", async () => {
    const retention = new FakeRetentionRepository([
      candidate({ lastReminderAt: new Date("2026-06-13T10:00:00.000Z") }),
    ]);
    expect((await sendRetentionReminders({ retention, now: () => AT })).sent).toBe(0);
  });

  it("un fallo con un suscriptor no deja sin aviso a los demás", async () => {
    const retention = new FakeRetentionRepository([
      candidate({ rentalId: "rental-1" }),
      candidate({ rentalId: "rental-2" }),
    ]);
    retention.failFor = "rental-1";

    const result = await sendRetentionReminders({ retention, now: () => AT });
    expect(result.sent).toBe(1);
    expect(retention.sent).toEqual(["rental-2"]);
  });
});
