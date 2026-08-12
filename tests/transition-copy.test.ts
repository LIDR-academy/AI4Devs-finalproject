import { beforeEach, describe, expect, it } from "vitest";

import type { CopyState } from "@/domain/copy/lifecycle";
import { ForbiddenError, InvariantViolationError, NotFoundError } from "@/domain/errors";
import type { CopySummary } from "@/repositories/copy.repository";
import { retireCopy } from "@/use-cases/copies/retire-copy";
import { transitionCopy } from "@/use-cases/copies/transition-copy";

import { FakeCopyRepository } from "./fakes/copy-repository";

const ADMIN = { id: "admin-1", role: "ADMIN" as const };
const OPERATOR = { id: "operator-1", role: "OPERATOR" as const };
const SUBSCRIBER = { id: "user-1", role: "SUBSCRIBER" as const };
const AT = new Date("2026-06-01T10:00:00.000Z");

function copyIn(state: CopyState): CopySummary {
  return { id: "copy-1", setId: "set-1", state, acquiredAt: AT, retiredAt: null };
}

let repository: FakeCopyRepository;

function withCopy(state: CopyState) {
  repository = new FakeCopyRepository([copyIn(state)]);
  return { repository, now: () => AT };
}

beforeEach(() => {
  repository = new FakeCopyRepository([]);
});

describe("alta de una copia (INTAKE → DISPONIBLE)", () => {
  it("el operador la cataloga y queda disponible", async () => {
    const deps = withCopy("INTAKE");
    const result = await transitionCopy(deps, {
      copyId: "copy-1",
      toState: "DISPONIBLE",
      actor: OPERATOR,
    });

    expect(result).toEqual({ copyId: "copy-1", fromState: "INTAKE", toState: "DISPONIBLE" });
    expect(deps.repository.transitions[0]).toMatchObject({ actorId: "operator-1", at: AT });
  });

  it("el suscriptor no puede catalogar copias", async () => {
    const deps = withCopy("INTAKE");
    await expect(
      transitionCopy(deps, { copyId: "copy-1", toState: "DISPONIBLE", actor: SUBSCRIBER })
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.repository.transitions).toHaveLength(0);
  });
});

describe("retorno: recepción, inspección e higienización", () => {
  it("recorre el camino feliz completo", async () => {
    const deps = withCopy("EN_DEVOLUCION");
    for (const to of ["EN_INSPECCION", "EN_HIGIENIZACION", "DISPONIBLE"] as const) {
      await transitionCopy(deps, { copyId: "copy-1", toState: to, actor: OPERATOR });
    }
    expect((await deps.repository.findById("copy-1"))?.state).toBe("DISPONIBLE");
    expect(deps.repository.transitions).toHaveLength(3);
  });

  it("guarda el motivo recortado y lo deja nulo si viene en blanco", async () => {
    const deps = withCopy("EN_DEVOLUCION");
    await transitionCopy(deps, {
      copyId: "copy-1",
      toState: "EN_INSPECCION",
      actor: OPERATOR,
      reason: "  recibida con la caja abierta  ",
    });
    expect(deps.repository.transitions[0].reason).toBe("recibida con la caja abierta");

    const other = withCopy("EN_DEVOLUCION");
    await transitionCopy(other, {
      copyId: "copy-1",
      toState: "EN_INSPECCION",
      actor: OPERATOR,
      reason: "   ",
    });
    expect(other.repository.transitions[0].reason).toBeNull();
  });
});

describe("rama INCOMPLETA", () => {
  it("el operador marca las piezas que faltan", async () => {
    const deps = withCopy("EN_INSPECCION");
    const result = await transitionCopy(deps, {
      copyId: "copy-1",
      toState: "INCOMPLETA",
      actor: OPERATOR,
      reason: "faltan 12 piezas",
    });
    expect(result.toState).toBe("INCOMPLETA");
  });

  it("una copia repuesta vuelve por higienización, no directamente a disponible", async () => {
    const deps = withCopy("INCOMPLETA");
    await expect(
      transitionCopy(deps, { copyId: "copy-1", toState: "DISPONIBLE", actor: OPERATOR })
    ).rejects.toBeInstanceOf(InvariantViolationError);

    await expect(
      transitionCopy(deps, { copyId: "copy-1", toState: "EN_HIGIENIZACION", actor: OPERATOR })
    ).resolves.toMatchObject({ toState: "EN_HIGIENIZACION" });
  });
});

describe("rama BAJA", () => {
  it("el admin la retira desde inspección, incompleta o alquilada", async () => {
    for (const from of ["EN_INSPECCION", "INCOMPLETA", "ALQUILADA"] as const) {
      const deps = withCopy(from);
      const result = await retireCopy(deps, {
        copyId: "copy-1",
        actor: ADMIN,
        reason: "daño irreparable",
      });
      expect(result.fromState).toBe(from);
      expect((await deps.repository.findById("copy-1"))?.retiredAt).toEqual(AT);
    }
  });

  it("el operador detecta y marca, pero no confirma la baja", async () => {
    const deps = withCopy("EN_INSPECCION");
    await expect(
      retireCopy(deps, { copyId: "copy-1", actor: OPERATOR, reason: "rota" })
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.repository.transitions).toHaveLength(0);

    // Lo que sí puede hacer es marcarla como incompleta.
    await expect(
      transitionCopy(deps, { copyId: "copy-1", toState: "INCOMPLETA", actor: OPERATOR })
    ).resolves.toMatchObject({ toState: "INCOMPLETA" });
  });

  it("no se puede retirar una copia que está en el almacén", async () => {
    // Si aparece rota estando DISPONIBLE, pasa antes por el camino de inspección:
    // es donde queda registrado el porqué.
    const deps = withCopy("DISPONIBLE");
    await expect(
      retireCopy(deps, { copyId: "copy-1", actor: ADMIN, reason: "rota en almacén" })
    ).rejects.toBeInstanceOf(InvariantViolationError);
  });

  it("no se puede retirar dos veces", async () => {
    const deps = withCopy("EN_INSPECCION");
    await retireCopy(deps, { copyId: "copy-1", actor: ADMIN, reason: "rota" });

    const error = await retireCopy(deps, {
      copyId: "copy-1",
      actor: ADMIN,
      reason: "otra vez",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvariantViolationError);
    expect((error as InvariantViolationError).code).toBe("COPY_STATE_CONFLICT");
  });
});

describe("transiciones que provoca el sistema", () => {
  it("no se pueden disparar a mano, ni siquiera siendo admin", async () => {
    // Mover una copia a ALQUILADA sin que exista el alquiler dejaría el dominio
    // incoherente; esas transiciones las provocan los flujos de cola y alquiler.
    for (const to of ["OFRECIDA", "ALQUILADA"] as const) {
      const deps = withCopy("DISPONIBLE");
      await expect(
        transitionCopy(deps, { copyId: "copy-1", toState: to, actor: ADMIN })
      ).rejects.toBeInstanceOf(ForbiddenError);
      expect(deps.repository.transitions).toHaveLength(0);
    }
  });
});

describe("caminos de error", () => {
  it("404 si la copia no existe", async () => {
    await expect(
      transitionCopy({ repository }, { copyId: "fantasma", toState: "DISPONIBLE", actor: OPERATOR })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("409 si otro proceso movió la copia entre la lectura y la escritura (CAS, D12)", async () => {
    const deps = withCopy("INTAKE");
    deps.repository.forceConflict = true;

    const error = await transitionCopy(deps, {
      copyId: "copy-1",
      toState: "DISPONIBLE",
      actor: OPERATOR,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvariantViolationError);
    expect((error as InvariantViolationError).code).toBe("COPY_STATE_CONFLICT");
  });

  it("comprueba el permiso antes de tocar la base", async () => {
    const deps = withCopy("EN_INSPECCION");
    await expect(
      transitionCopy(deps, { copyId: "copy-1", toState: "BAJA", actor: SUBSCRIBER })
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(deps.repository.transitions).toHaveLength(0);
  });
});
