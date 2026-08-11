import { prisma } from "@/db/prisma";
import { canRetire, type CopyState } from "@/domain/copy/lifecycle";
import type { CopyRepository, RetireCopyOutcome } from "@/repositories/copy.repository";

/** Adaptador Prisma del puerto `CopyRepository`. */

/** Cliente dentro de una transacción de Prisma. */
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * **Único camino** por el que cambia el estado de una copia.
 *
 * Une en un solo movimiento las dos cosas que nunca deben separarse: el
 * compare-and-swap de D12 y el registro de auditoría de PRD §7. Mientras todas las
 * transiciones pasen por aquí, es imposible dejar una copia en un estado nuevo sin
 * saber quién la movió — y como la firma exige `actorId`, tampoco se puede registrar
 * de forma anónima.
 *
 * Devuelve `false` si la precondición de estado falló; quien llama decide qué error
 * de dominio corresponde.
 */
async function applyTransition(
  tx: Tx,
  input: {
    copyId: string;
    fromState: CopyState;
    toState: CopyState;
    actorId: string;
    reason: string | null;
    at: Date;
    /** Campos extra de la copia que acompañan a la transición (p. ej. `retiredAt`). */
    copyData?: Record<string, unknown>;
  }
): Promise<boolean> {
  // El estado esperado va en el WHERE: si otro proceso lo movió entre la lectura y
  // esta escritura, `count` es 0 y el perdedor falla de forma determinista, sin
  // bloqueos ni serialización global (D12).
  const { count } = await tx.copy.updateMany({
    where: { id: input.copyId, state: input.fromState },
    data: { state: input.toState, ...input.copyData },
  });
  if (count === 0) return false;

  await tx.copyStateTransition.create({
    data: {
      copyId: input.copyId,
      actorId: input.actorId,
      fromState: input.fromState,
      toState: input.toState,
      reason: input.reason,
      createdAt: input.at,
    },
  });

  return true;
}

export const prismaCopyRepository: CopyRepository = {
  async retire({ copyId, actorId, reason, at }): Promise<RetireCopyOutcome> {
    // Transacción: la baja y su auditoría entran juntas o no entra ninguna. Una copia
    // retirada sin rastro de quién fue sería peor que no retirarla.
    return prisma.$transaction(async (tx) => {
      const copy = await tx.copy.findUnique({
        where: { id: copyId },
        select: { state: true },
      });
      if (!copy) return { outcome: "not_found" as const };

      const fromState = copy.state as CopyState;
      if (!canRetire(fromState)) return { outcome: "already_retired" as const };

      const applied = await applyTransition(tx, {
        copyId,
        fromState,
        toState: "BAJA",
        actorId,
        reason,
        at,
        copyData: { retiredAt: at },
      });
      if (!applied) return { outcome: "conflict" as const };

      return { outcome: "retired" as const, fromState };
    });
  },
};
