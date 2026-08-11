import { prisma } from "@/db/prisma";
import { canRetire, type CopyState } from "@/domain/copy/lifecycle";
import type { CopyRepository } from "@/repositories/copy.repository";

/** Adaptador Prisma del puerto `CopyRepository`. */
export const prismaCopyRepository: CopyRepository = {
  async retire({ copyId, actorId, reason, at }) {
    // Transacción: la baja y su registro de auditoría entran juntos o no entra
    // ninguno. Una copia retirada sin rastro de quién fue sería peor que no retirarla.
    return prisma.$transaction(async (tx) => {
      const copy = await tx.copy.findUnique({
        where: { id: copyId },
        select: { state: true },
      });
      if (!copy) return { outcome: "not_found" as const };

      const fromState = copy.state as CopyState;
      if (!canRetire(fromState)) return { outcome: "already_retired" as const };

      // Compare-and-swap (D12): la escritura solo prospera si el estado sigue siendo
      // el que se leyó. Si otro proceso lo movió mientras tanto, `count` es 0 y el
      // perdedor falla de forma determinista, sin bloqueos ni serialización global.
      const { count } = await tx.copy.updateMany({
        where: { id: copyId, state: fromState },
        data: { state: "BAJA", retiredAt: at },
      });
      if (count === 0) return { outcome: "conflict" as const };

      await tx.copyStateTransition.create({
        data: { copyId, actorId, fromState, toState: "BAJA", reason, createdAt: at },
      });

      return { outcome: "retired" as const, fromState };
    });
  },
};
