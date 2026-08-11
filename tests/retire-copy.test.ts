import { describe, expect, it } from "vitest";

import { canRetire, COPY_STATES, isTerminalCopyState } from "@/domain/copy/lifecycle";
import { ForbiddenError, InvariantViolationError, NotFoundError } from "@/domain/errors";
import type { CopyRepository, RetireCopyOutcome } from "@/repositories/copy.repository";
import { retireCopy } from "@/use-cases/copies/retire-copy";

const ADMIN = { id: "admin-1", role: "ADMIN" as const };
const OPERATOR = { id: "operator-1", role: "OPERATOR" as const };
const SUBSCRIBER = { id: "user-1", role: "SUBSCRIBER" as const };

/** Repositorio de mentira que devuelve un desenlace fijo y anota lo que recibió. */
function fakeRepository(outcome: RetireCopyOutcome) {
  const calls: Array<{ copyId: string; actorId: string; reason: string; at: Date }> = [];
  const repository: CopyRepository = {
    async retire(input) {
      calls.push(input);
      return outcome;
    },
  };
  return { repository, calls };
}

describe("ciclo de vida: retirada", () => {
  it("permite retirar desde cualquier estado salvo la propia baja", () => {
    for (const state of COPY_STATES) {
      expect(canRetire(state)).toBe(state !== "BAJA");
    }
  });

  it("trata BAJA como estado terminal", () => {
    expect(isTerminalCopyState("BAJA")).toBe(true);
    expect(isTerminalCopyState("DISPONIBLE")).toBe(false);
  });
});

describe("dar de baja una copia (HU-15)", () => {
  it("el admin la retira y recibe el estado del que venía", async () => {
    const { repository, calls } = fakeRepository({
      outcome: "retired",
      fromState: "ALQUILADA",
    });
    const at = new Date("2026-04-01T09:00:00.000Z");

    const result = await retireCopy(
      { repository, now: () => at },
      { copyId: "copy-1", actor: ADMIN, reason: "Pérdida durante el alquiler" }
    );

    expect(result).toEqual({ copyId: "copy-1", fromState: "ALQUILADA" });
    // El autor y el instante viajan al repositorio: son el "quién y cuándo" que
    // exige la auditoría.
    expect(calls).toEqual([
      { copyId: "copy-1", actorId: "admin-1", reason: "Pérdida durante el alquiler", at },
    ]);
  });

  // ── Caminos de error ───────────────────────────────────────────────────────

  it("rechaza al operador sin llegar a tocar la base", async () => {
    const { repository, calls } = fakeRepository({ outcome: "retired", fromState: "DISPONIBLE" });

    await expect(
      retireCopy({ repository }, { copyId: "copy-1", actor: OPERATOR, reason: "Rota" })
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(calls).toHaveLength(0);
  });

  it("rechaza también al suscriptor", async () => {
    const { repository } = fakeRepository({ outcome: "retired", fromState: "DISPONIBLE" });
    await expect(
      retireCopy({ repository }, { copyId: "copy-1", actor: SUBSCRIBER, reason: "Rota" })
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("devuelve 404 de dominio si la copia no existe", async () => {
    const { repository } = fakeRepository({ outcome: "not_found" });
    await expect(
      retireCopy({ repository }, { copyId: "fantasma", actor: ADMIN, reason: "Rota" })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rechaza con conflicto si la copia ya estaba de baja", async () => {
    const { repository } = fakeRepository({ outcome: "already_retired" });

    const error = await retireCopy(
      { repository },
      { copyId: "copy-1", actor: ADMIN, reason: "Rota" }
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvariantViolationError);
    expect((error as InvariantViolationError).code).toBe("COPY_STATE_CONFLICT");
  });

  it("rechaza con conflicto si otro proceso movió el estado mientras tanto (CAS, D12)", async () => {
    const { repository } = fakeRepository({ outcome: "conflict" });

    const error = await retireCopy(
      { repository },
      { copyId: "copy-1", actor: ADMIN, reason: "Rota" }
    ).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(InvariantViolationError);
    expect((error as InvariantViolationError).code).toBe("COPY_STATE_CONFLICT");
  });
});
