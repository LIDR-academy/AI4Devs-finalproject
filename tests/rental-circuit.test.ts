import { beforeEach, describe, expect, it } from "vitest";

import { canReportDiscrepancy, deliveryConfirmation } from "@/domain/rentals/delivery";
import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
  ValidationError,
} from "@/domain/errors";
import { SYSTEM_SETTINGS } from "@/domain/settings/system-settings";
import type { CopySummary } from "@/repositories/copy.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";
import type {
  ActiveSubscription,
  SubscriptionRepository,
} from "@/repositories/subscription.repository";
import {
  recordDeliveryCondition,
  recordInspection,
  reportDeliveryDiscrepancy,
  startReturn,
} from "@/use-cases/rentals/delivery-and-return";
import { requestSet } from "@/use-cases/rentals/request-set";
import { transitionCopy } from "@/use-cases/copies/transition-copy";

import { FakeCopyRepository } from "./fakes/copy-repository";
import { FakeRentalRepository } from "./fakes/rental-repository";

const SUBSCRIBER = { id: "user-1", role: "SUBSCRIBER" as const };
const OPERATOR = { id: "operator-1", role: "OPERATOR" as const };
const AT = new Date("2026-07-01T10:00:00.000Z");

const SUBSCRIPTION: ActiveSubscription = {
  id: "sub-1",
  userId: "user-1",
  planCode: "PREMIUM",
  status: "ACTIVE",
  startedAt: new Date("2025-01-01T00:00:00.000Z"),
  maxSimultaneousSets: 2,
  queueBonusDays: 10,
};

const settings: SettingsRepository = { async load() { return { ...SYSTEM_SETTINGS }; } };

const sets = {
  async findById(setId: string) {
    if (setId !== "set-1") return null;
    return {
      id: "set-1",
      setNum: null,
      themeId: "theme-1",
      name: "Set de prueba",
      year: null,
      pieceCount: 100,
      recommendedAge: null,
      difficulty: null,
      referenceValue: "100.00",
      boxPhotoUrl: null,
      restricted: false,
      published: true,
    };
  },
  async create() { throw new Error("no usado"); },
  async update() { return null; },
  async setPublished() { return null; },
  async themeExists() { return true; },
  // El circuito de alquiler no lista el catálogo; el puerto los exige y no se usan.
  async listManaged() { throw new Error("no usado"); },
  async listThemes() { return []; },
};

function subscriptionsFor(
  states: string[] = [],
  subscription: ActiveSubscription | null = SUBSCRIPTION
): SubscriptionRepository {
  return {
    async findCurrentSubscription() { return subscription; },
    async currentCopyStates() { return states as never; },
    async updateStatus() { return null; },
    async changePlan() { return null; },
    async listPlans() { return []; },
    async updatePlan() { return null; },
  };
}

function copy(id: string, state: CopySummary["state"]): CopySummary {
  return { id, setId: "set-1", state, acquiredAt: AT, retiredAt: null };
}

let copies: FakeCopyRepository;
let rentals: FakeRentalRepository;

/** Mueve la copia; el alquiler se sincroniza solo, como en la transacción real. */
async function move(copyId: string, to: CopySummary["state"], actor = OPERATOR) {
  return transitionCopy({ repository: copies, now: () => AT }, { copyId, toState: to, actor });
}

beforeEach(() => {
  copies = new FakeCopyRepository([copy("copy-1", "DISPONIBLE")]);
  rentals = new FakeRentalRepository(copies);
});

function flowDeps() {
  return { rentals, copies, settings, now: () => AT };
}

describe("solicitud y asignación (5.1)", () => {
  it("asigna una copia disponible y la deja alquilada", async () => {
    const result = await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );

    expect(result.outcome).toBe("assigned");
    expect((await copies.findById("copy-1"))?.state).toBe("ALQUILADA");
  });

  it("guarda un snapshot de la dirección, no una referencia", async () => {
    await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    // Cambiar la dirección después no debe alterar el envío ya registrado.
    rentals.address = { line1: "Otra calle" };
    expect(rentals.rentals[0].startedAt).toEqual(AT);
  });

  it("sin copias libres ofrece la cola en vez de fallar", async () => {
    copies = new FakeCopyRepository([copy("copy-1", "ALQUILADA")]);
    rentals = new FakeRentalRepository(copies);

    const result = await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    expect(result).toEqual({ outcome: "no_copy_available", canQueue: true });
  });

  it("rechaza a quien no es elegible sin tocar el inventario", async () => {
    await expect(
      requestSet(
        {
          rentals,
          subscriptions: subscriptionsFor(["ALQUILADA", "ALQUILADA"]),
          sets,
          settings,
          now: () => AT,
        },
        { userId: "user-1", setId: "set-1" }
      )
    ).rejects.toBeInstanceOf(InvariantViolationError);
    expect((await copies.findById("copy-1"))?.state).toBe("DISPONIBLE");
  });

  it("exige dirección de envío", async () => {
    rentals.address = null;
    await expect(
      requestSet(
        { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
        { userId: "user-1", setId: "set-1" }
      )
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("404 si el set no existe o no está publicado", async () => {
    await expect(
      requestSet(
        { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
        { userId: "user-1", setId: "fantasma" }
      )
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  // ── Alquilar exige plan activo ─────────────────────────────────────────────
  // Estos tres reemplazan a los del alquiler puntual: la vía sin suscripción se retiró
  // (`plan-obligatorio-en-alta`) y lo que hay que fijar ahora es el rechazo.

  it("rechaza a quien no tiene ninguna suscripción, sin tocar el inventario", async () => {
    const error = await requestSet(
      { rentals, subscriptions: subscriptionsFor([], null), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvariantViolationError);
    // Código propio: esto se arregla contratando un plan, no devolviendo un set.
    expect((error as InvariantViolationError).code).toBe("NO_ACTIVE_SUBSCRIPTION");
    expect((await copies.findById("copy-1"))?.state).toBe("DISPONIBLE");
    expect(rentals.rentals).toHaveLength(0);
  });

  it("rechaza también a quien la pausó o la canceló", async () => {
    for (const status of ["PAUSED", "CANCELLED"] as const) {
      const inactive = subscriptionsFor([], { ...SUBSCRIPTION, status });
      const error = await requestSet(
        { rentals, subscriptions: inactive, sets, settings, now: () => AT },
        { userId: "user-1", setId: "set-1" }
      ).catch((caught: unknown) => caught);

      expect((error as InvariantViolationError).code).toBe("NO_ACTIVE_SUBSCRIPTION");
    }
  });

  it("el tope de plan se distingue de la falta de plan", async () => {
    // La acción que resuelve cada caso es distinta, así que el código también.
    const atLimit = subscriptionsFor(["ALQUILADA", "ALQUILADA"]);
    const error = await requestSet(
      { rentals, subscriptions: atLimit, sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    ).catch((caught: unknown) => caught);

    expect((error as InvariantViolationError).code).toBe("NOT_ELIGIBLE");
  });

  it("todo alquiler nace de un plan: sin precio y con su suscripción", async () => {
    await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    // `price` sigue existiendo en el esquema (design.md §3) pero ya no se puebla.
    expect(rentals.rentals[0]).toMatchObject({ type: "SUBSCRIPTION", price: null });
  });
});

describe("registro de condición en la entrega (5.2)", () => {
  async function withActiveRental() {
    await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    return rentals.rentals[0].id;
  }

  it("el operador registra el estado y se prepara el envío", async () => {
    const rentalId = await withActiveRental();
    const { report } = await recordDeliveryCondition(flowDeps(), {
      rentalId,
      actor: OPERATOR,
      result: "OK",
      // Las dos casillas del catálogo ratificado, no un diccionario libre (§4.3).
      checklist: { pieceCount: true, manual: true },
    });

    expect(report).toMatchObject({ kind: "DELIVERY", result: "OK", operatorId: "operator-1" });
    expect(rentals.shipments).toContainEqual(
      expect.objectContaining({ direction: "OUTBOUND" })
    );
  });

  it("un alquiler tiene un único registro de entrega", async () => {
    const rentalId = await withActiveRental();
    await recordDeliveryCondition(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" });

    // El segundo crearía otro envío de salida y movería el reloj de la discrepancia,
    // que ya está corriendo. La cola de trabajo lo evita, pero no es la única puerta.
    await expect(
      recordDeliveryCondition(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" })
    ).rejects.toMatchObject({ code: "COPY_STATE_CONFLICT" });
  });

  it("las observaciones se guardan recortadas", async () => {
    const rentalId = await withActiveRental();
    const { report } = await recordDeliveryCondition(flowDeps(), {
      rentalId,
      actor: OPERATOR,
      result: "DAMAGED",
      notes: "  Esquina de la caja golpeada  ",
    });
    expect(report.notes).toBe("Esquina de la caja golpeada");
  });

  it("unas observaciones en blanco son ausencia, no ruido", async () => {
    const rentalId = await withActiveRental();
    const { report } = await recordDeliveryCondition(flowDeps(), {
      rentalId,
      actor: OPERATOR,
      result: "OK",
      notes: "   ",
    });
    expect(report.notes).toBeNull();
  });

  it("el suscriptor no registra el estado de entrega", async () => {
    const rentalId = await withActiveRental();
    await expect(
      recordDeliveryCondition(flowDeps(), { rentalId, actor: SUBSCRIBER, result: "OK" })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("la discrepancia abre incidencia y no se le imputa al suscriptor", async () => {
    const rentalId = await withActiveRental();
    await recordDeliveryCondition(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" });

    const { incidentId } = await reportDeliveryDiscrepancy(flowDeps(), {
      rentalId,
      actor: SUBSCRIBER,
      notes: "Llegó con dos piezas rotas",
    });

    expect(incidentId).toBeTruthy();
    const incident = rentals.incidents[0];
    expect(incident.type).toBe("DELIVERY_DISCREPANCY");
    // Quien la reporta es el suscriptor, pero eso no es una imputación: no hay ningún
    // cargo ni penalización asociada.
    expect(incident.reportedById).toBe("user-1");
  });

  it("no se puede reportar una discrepancia dos veces", async () => {
    const rentalId = await withActiveRental();
    await recordDeliveryCondition(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" });
    await reportDeliveryDiscrepancy(flowDeps(), { rentalId, actor: SUBSCRIBER, notes: "rota" });

    await expect(
      reportDeliveryDiscrepancy(flowDeps(), { rentalId, actor: SUBSCRIBER, notes: "otra vez" })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });

  it("no se puede reportar sobre un alquiler ajeno", async () => {
    const rentalId = await withActiveRental();
    await recordDeliveryCondition(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" });

    await expect(
      reportDeliveryDiscrepancy(flowDeps(), {
        rentalId,
        actor: { id: "otro", role: "SUBSCRIBER" },
        notes: "rota",
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("no se puede reportar si aún no hay registro de entrega que comparar", async () => {
    const rentalId = await withActiveRental();
    await expect(
      reportDeliveryDiscrepancy(flowDeps(), { rentalId, actor: SUBSCRIBER, notes: "rota" })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });
});

describe("confirmación de entrega (D8)", () => {
  const reportedAt = new Date("2026-07-01T10:00:00.000Z");
  const base = { reportedAt, windowHours: 48, hasDiscrepancy: false };

  it("está pendiente mientras la ventana sigue abierta", () => {
    const result = deliveryConfirmation({ ...base, now: new Date("2026-07-02T10:00:00.000Z") });
    expect(result.status).toBe("pending");
  });

  it("se da por conforme al pasar la ventana sin reclamación", () => {
    // La conformidad tácita no se guarda: se deduce de lo que ya hay registrado.
    expect(
      deliveryConfirmation({ ...base, now: new Date("2026-07-03T10:00:01.000Z") }).status
    ).toBe("tacit");
  });

  it("una discrepancia manda sobre el paso del tiempo", () => {
    expect(
      deliveryConfirmation({
        ...base,
        hasDiscrepancy: true,
        now: new Date("2026-07-30T10:00:00.000Z"),
      }).status
    ).toBe("disputed");
  });

  it("la ventana se cierra en su instante exacto", () => {
    const limit = new Date("2026-07-03T10:00:00.000Z");
    expect(canReportDiscrepancy({ ...base, now: new Date(limit.getTime() - 1) })).toBe(true);
    expect(canReportDiscrepancy({ ...base, now: limit })).toBe(false);
  });
});

describe("circuito completo E2E (5.7)", () => {
  it("recorre entrega, alquiler, devolución, inspección, higiene y vuelta a disponible", async () => {
    // 1. Solicitud y asignación.
    const result = await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    expect(result.outcome).toBe("assigned");
    const rentalId = rentals.rentals[0].id;
    expect((await copies.findById("copy-1"))?.state).toBe("ALQUILADA");

    // 2. Registro de condición antes del envío.
    await recordDeliveryCondition(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" });

    // 3. El suscriptor inicia la devolución.
    await startReturn(flowDeps(), { rentalId, actor: SUBSCRIBER });
    expect((await copies.findById("copy-1"))?.state).toBe("EN_DEVOLUCION");
    expect((await rentals.findById(rentalId))?.status).toBe("RETURN_INITIATED");
    expect(rentals.shipments).toContainEqual(expect.objectContaining({ direction: "RETURN" }));

    // 4. El operador recepciona: queda registrado quién.
    await move("copy-1", "EN_INSPECCION");
    expect((await rentals.findById(rentalId))?.status).toBe("IN_INSPECTION");
    expect(copies.transitions.at(-1)?.actorId).toBe("operator-1");

    // 5. Inspección correcta.
    await recordInspection(flowDeps(), { rentalId, actor: OPERATOR, result: "OK" });
    await move("copy-1", "EN_HIGIENIZACION");

    // 6. Higienización terminada: vuelve a circulación y el alquiler se cierra.
    await move("copy-1", "DISPONIBLE");
    expect((await copies.findById("copy-1"))?.state).toBe("DISPONIBLE");
    expect((await rentals.findById(rentalId))?.status).toBe("COMPLETED");

    // El recorrido dejó su rastro completo de auditoría.
    expect(copies.transitions.map((t) => t.toState)).toEqual([
      "ALQUILADA",
      "EN_DEVOLUCION",
      "EN_INSPECCION",
      "EN_HIGIENIZACION",
      "DISPONIBLE",
    ]);
  });

  it("solo el dueño del alquiler puede iniciar su devolución", async () => {
    await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    await expect(
      startReturn(flowDeps(), {
        rentalId: rentals.rentals[0].id,
        actor: { id: "otro", role: "SUBSCRIBER" },
      })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("no se puede devolver dos veces", async () => {
    await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    const rentalId = rentals.rentals[0].id;
    await startReturn(flowDeps(), { rentalId, actor: SUBSCRIBER });

    await expect(
      startReturn(flowDeps(), { rentalId, actor: SUBSCRIBER })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });

  it("la inspección solo se registra con la copia en inspección", async () => {
    await requestSet(
      { rentals, subscriptions: subscriptionsFor(), sets, settings, now: () => AT },
      { userId: "user-1", setId: "set-1" }
    );
    await expect(
      recordInspection(flowDeps(), { rentalId: rentals.rentals[0].id, actor: OPERATOR, result: "OK" })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });
});
