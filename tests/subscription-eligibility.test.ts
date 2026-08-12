import { describe, expect, it } from "vitest";

import type { CopyState } from "@/domain/copy/lifecycle";
import {
  canEndSubscription,
  checkEligibility,
  monthsBetween,
  occupiesPlanSlot,
  type EligibilityInput,
} from "@/domain/subscriptions/eligibility";

const NOW = new Date("2026-06-15T10:00:00.000Z");

function input(overrides: Partial<EligibilityInput> = {}): EligibilityInput {
  return {
    subscription: {
      status: "ACTIVE",
      startedAt: new Date("2025-06-15T10:00:00.000Z"), // un año de antigüedad
      maxSimultaneousSets: 1,
    },
    currentCopyStates: [],
    set: { restricted: false },
    restrictedSetMinMonths: 3,
    now: NOW,
    ...overrides,
  };
}

describe("qué copias ocupan plaza del plan", () => {
  it("ocupan las alquiladas y todas las que están volviendo", () => {
    // La plaza no se libera al iniciar la devolución, sino cuando la copia vuelve a
    // estar disponible: así la regla "no hay set nuevo hasta completar la devolución"
    // se cae del propio límite de plan, sin comprobación aparte.
    for (const state of ["ALQUILADA", "EN_DEVOLUCION", "EN_INSPECCION", "EN_HIGIENIZACION"] as const) {
      expect(occupiesPlanSlot(state)).toBe(true);
    }
  });

  it("no ocupan las que ya están en circulación ni las retiradas", () => {
    for (const state of ["INTAKE", "DISPONIBLE", "OFRECIDA", "BAJA"] as CopyState[]) {
      expect(occupiesPlanSlot(state)).toBe(false);
    }
  });
});

describe("límite de sets del plan", () => {
  it("un BASIC con un set fuera no puede pedir otro", () => {
    const result = checkEligibility(input({ currentCopyStates: ["ALQUILADA"] }));
    expect(result).toMatchObject({ eligible: false, reason: "PLAN_LIMIT_REACHED" });
  });

  it("un PREMIUM puede tener dos y no un tercero", () => {
    const premium = { status: "ACTIVE" as const, startedAt: new Date("2025-01-01"), maxSimultaneousSets: 2 };

    expect(
      checkEligibility(input({ subscription: premium, currentCopyStates: ["ALQUILADA"] }))
    ).toEqual({ eligible: true });

    expect(
      checkEligibility(
        input({ subscription: premium, currentCopyStates: ["ALQUILADA", "ALQUILADA"] })
      )
    ).toMatchObject({ eligible: false, reason: "PLAN_LIMIT_REACHED" });
  });

  it("sin sets fuera, adelante", () => {
    expect(checkEligibility(input())).toEqual({ eligible: true });
  });
});

describe("devolución sin completar", () => {
  it("bloquea, y lo distingue del límite por sets en casa", () => {
    for (const state of ["EN_DEVOLUCION", "EN_INSPECCION", "EN_HIGIENIZACION"] as const) {
      const result = checkEligibility(input({ currentCopyStates: [state] }));
      // El motivo importa: devolver algo y esperar a que termine el proceso son
      // acciones distintas para el suscriptor.
      expect(result).toMatchObject({ eligible: false, reason: "RETURN_IN_PROGRESS" });
    }
  });

  it("la plaza se libera cuando la copia vuelve a estar disponible", () => {
    expect(checkEligibility(input({ currentCopyStates: ["DISPONIBLE"] }))).toEqual({
      eligible: true,
    });
  });
});

describe("antigüedad mínima para sets restringidos", () => {
  it("rechaza a quien no llega, diciendo cuánto le falta", () => {
    const result = checkEligibility(
      input({
        subscription: {
          status: "ACTIVE",
          startedAt: new Date("2026-05-15T10:00:00.000Z"), // un mes
          maxSimultaneousSets: 1,
        },
        set: { restricted: true },
      })
    );

    expect(result).toMatchObject({ eligible: false, reason: "SUBSCRIPTION_TOO_RECENT" });
    if (!result.eligible) {
      expect(result.detail).toContain("3 meses");
      expect(result.detail).toContain("llevas 1");
    }
  });

  it("acepta a quien justo cumple la antigüedad", () => {
    const result = checkEligibility(
      input({
        subscription: {
          status: "ACTIVE",
          startedAt: new Date("2026-03-15T10:00:00.000Z"), // exactamente 3 meses
          maxSimultaneousSets: 1,
        },
        set: { restricted: true },
      })
    );
    expect(result).toEqual({ eligible: true });
  });

  it("no exige antigüedad para sets no restringidos", () => {
    const result = checkEligibility(
      input({
        subscription: {
          status: "ACTIVE",
          startedAt: new Date("2026-06-14T10:00:00.000Z"), // un día
          maxSimultaneousSets: 1,
        },
      })
    );
    expect(result).toEqual({ eligible: true });
  });

  it("respeta el umbral configurado por el admin", () => {
    const recent = {
      status: "ACTIVE" as const,
      startedAt: new Date("2026-04-15T10:00:00.000Z"), // 2 meses
      maxSimultaneousSets: 1,
    };
    expect(
      checkEligibility(input({ subscription: recent, set: { restricted: true }, restrictedSetMinMonths: 6 }))
    ).toMatchObject({ eligible: false });
    expect(
      checkEligibility(input({ subscription: recent, set: { restricted: true }, restrictedSetMinMonths: 1 }))
    ).toEqual({ eligible: true });
  });
});

describe("meses completos entre dos fechas", () => {
  it("no cuenta el mes hasta que se alcanza el día", () => {
    expect(monthsBetween(new Date("2026-01-15"), new Date("2026-02-14"))).toBe(0);
    expect(monthsBetween(new Date("2026-01-15"), new Date("2026-02-15"))).toBe(1);
    expect(monthsBetween(new Date("2026-01-15"), new Date("2026-04-20"))).toBe(3);
  });

  it("nunca devuelve negativo con fechas futuras", () => {
    expect(monthsBetween(new Date("2026-06-15"), new Date("2026-01-01"))).toBe(0);
  });
});

describe("suscripción no activa", () => {
  it("bloquea sin suscripción, pausada o cancelada", () => {
    for (const subscription of [
      null,
      { status: "PAUSED" as const, startedAt: new Date("2020-01-01"), maxSimultaneousSets: 2 },
      { status: "CANCELLED" as const, startedAt: new Date("2020-01-01"), maxSimultaneousSets: 2 },
    ]) {
      expect(checkEligibility(input({ subscription }))).toMatchObject({
        eligible: false,
        reason: "NO_ACTIVE_SUBSCRIPTION",
      });
    }
  });
});

describe("pausar o cancelar la suscripción", () => {
  it("se bloquea con una copia en su poder", () => {
    for (const state of ["ALQUILADA", "EN_DEVOLUCION"] as const) {
      expect(canEndSubscription([state])).toMatchObject({ eligible: false });
    }
  });

  it("se permite una vez la copia ha llegado a nuestras manos", () => {
    // Si ya está en inspección, el suscriptor cumplió con devolverla; retenerle la
    // suscripción por nuestro proceso interno sería injusto.
    for (const state of ["EN_INSPECCION", "EN_HIGIENIZACION", "DISPONIBLE"] as CopyState[]) {
      expect(canEndSubscription([state])).toEqual({ eligible: true });
    }
  });

  it("sin copias, adelante", () => {
    expect(canEndSubscription([])).toEqual({ eligible: true });
  });

  it("cuenta cuántos sets faltan por devolver", () => {
    const result = canEndSubscription(["ALQUILADA", "ALQUILADA"]);
    expect(result.eligible).toBe(false);
    if (!result.eligible) expect(result.detail).toContain("2 sets");
  });
});
