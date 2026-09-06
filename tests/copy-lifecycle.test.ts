import { describe, expect, it } from "vitest";

import {
  assertTransition,
  canRetireFrom,
  canTransition,
  COPY_STATES,
  COPY_TRANSITIONS,
  isTerminalCopyState,
  nextStates,
  type CopyState,
} from "@/domain/copy/lifecycle";
import { InvariantViolationError } from "@/domain/errors";

/**
 * Tabla de PRD §15.5, transcrita a mano. Duplicarla aquí es intencionado: si alguien
 * cambia la máquina de estados, el test tiene que cambiar también — que es
 * exactamente la conversación que debe provocar tocar el ciclo de vida del dominio.
 */
const EXPECTED: ReadonlyArray<[CopyState, CopyState]> = [
  ["INTAKE", "DISPONIBLE"],
  ["DISPONIBLE", "OFRECIDA"],
  ["OFRECIDA", "DISPONIBLE"],
  ["OFRECIDA", "ALQUILADA"],
  ["DISPONIBLE", "ALQUILADA"],
  ["ALQUILADA", "EN_DEVOLUCION"],
  ["EN_DEVOLUCION", "EN_INSPECCION"],
  ["EN_INSPECCION", "EN_HIGIENIZACION"],
  ["EN_INSPECCION", "INCOMPLETA"],
  ["INCOMPLETA", "EN_HIGIENIZACION"],
  ["EN_HIGIENIZACION", "DISPONIBLE"],
  ["EN_INSPECCION", "BAJA"],
  ["INCOMPLETA", "BAJA"],
  ["ALQUILADA", "BAJA"],
];

describe("máquina de estados de la copia (PRD §15.5)", () => {
  it("contiene exactamente las transiciones definidas, ni una más", () => {
    const actual = COPY_TRANSITIONS.map((t) => `${t.from}->${t.to}`).sort();
    const expected = EXPECTED.map(([from, to]) => `${from}->${to}`).sort();
    expect(actual).toEqual(expected);
  });

  it("acepta todas las transiciones válidas", () => {
    for (const [from, to] of EXPECTED) {
      expect(canTransition(from, to)).toBe(true);
    }
  });

  it("rechaza cualquier par que no esté en la tabla", () => {
    const valid = new Set(EXPECTED.map(([from, to]) => `${from}->${to}`));
    for (const from of COPY_STATES) {
      for (const to of COPY_STATES) {
        if (valid.has(`${from}->${to}`)) continue;
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });

  it("rechaza saltarse la inspección", () => {
    // Escenario explícito de la spec.
    expect(canTransition("EN_DEVOLUCION", "DISPONIBLE")).toBe(false);
    expect(() => assertTransition("EN_DEVOLUCION", "DISPONIBLE")).toThrow(
      InvariantViolationError
    );
  });

  it("rechaza volver al estado inicial y quedarse en el mismo estado", () => {
    for (const state of COPY_STATES) {
      expect(canTransition(state, state)).toBe(false);
      expect(canTransition(state, "INTAKE")).toBe(false);
    }
  });

  it("marca el fallo como conflicto de estado, no como error de formato", () => {
    const error = (() => {
      try {
        assertTransition("DISPONIBLE", "EN_HIGIENIZACION");
      } catch (caught) {
        return caught as InvariantViolationError;
      }
    })();
    // La petición no está mal escrita: choca con el estado actual del recurso.
    expect(error?.code).toBe("COPY_STATE_CONFLICT");
  });

  it("trata BAJA como terminal: no sale ninguna transición de ella", () => {
    expect(isTerminalCopyState("BAJA")).toBe(true);
    expect(nextStates("BAJA")).toEqual([]);
  });

  it("solo permite la baja desde inspección, incompleta y alquilada", () => {
    // Las tres causas de baja: daño irreparable, no reparable y pérdida en préstamo.
    for (const state of COPY_STATES) {
      const expected = ["EN_INSPECCION", "INCOMPLETA", "ALQUILADA"].includes(state);
      expect(canRetireFrom(state)).toBe(expected);
    }
    // Una copia en almacén NO se retira de golpe: pasa por el camino de inspección,
    // que es donde queda registrado el porqué.
    expect(canRetireFrom("DISPONIBLE")).toBe(false);
  });

  it("todo estado no terminal tiene salida: ninguna copia queda atrapada", () => {
    for (const state of COPY_STATES) {
      if (isTerminalCopyState(state)) continue;
      expect(nextStates(state).length).toBeGreaterThan(0);
    }
  });

  it("todo estado es alcanzable desde INTAKE", () => {
    const reachable = new Set<CopyState>(["INTAKE"]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const t of COPY_TRANSITIONS) {
        if (reachable.has(t.from) && !reachable.has(t.to)) {
          reachable.add(t.to);
          grew = true;
        }
      }
    }
    // Un estado inalcanzable sería código muerto disfrazado de regla de negocio.
    expect([...reachable].sort()).toEqual([...COPY_STATES].sort());
  });
});

describe("quién provoca cada transición", () => {
  it("reserva a la máquina las de cola y alquiler", () => {
    for (const [from, to] of [
      ["DISPONIBLE", "OFRECIDA"],
      ["OFRECIDA", "ALQUILADA"],
      ["DISPONIBLE", "ALQUILADA"],
      ["ALQUILADA", "EN_DEVOLUCION"],
    ] as const) {
      const transition = assertTransition(from, to);
      expect(transition.driver).toBe("system");
      expect(transition.permission).toBeNull();
    }
  });

  it("exige el permiso adecuado en las de operador", () => {
    expect(assertTransition("INTAKE", "DISPONIBLE").permission).toBe("copy.advance_lifecycle");
    expect(assertTransition("EN_DEVOLUCION", "EN_INSPECCION").permission).toBe("copy.advance_lifecycle");
    expect(assertTransition("EN_INSPECCION", "INCOMPLETA").permission).toBe("incident.mark");
  });

  it("exige permiso de baja en las tres transiciones a BAJA", () => {
    for (const from of ["EN_INSPECCION", "INCOMPLETA", "ALQUILADA"] as const) {
      expect(assertTransition(from, "BAJA").permission).toBe("copy.retire");
    }
  });
});
