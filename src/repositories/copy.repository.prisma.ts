import { prisma } from "@/db/prisma";
import { canTransition, type CopyState } from "@/domain/copy/lifecycle";
import { applyTransition } from "@/repositories/copy-transitions";
import type {
  CopyRepository,
  CopySummary,
  InventoryCopy,
  TransitionCopyOutcome,
} from "@/repositories/copy.repository";

/** Adaptador Prisma del puerto `CopyRepository`. */

const COPY_SELECT = {
  id: true,
  setId: true,
  state: true,
  acquiredAt: true,
  retiredAt: true,
} as const;

export const prismaCopyRepository: CopyRepository = {
  async findById(copyId) {
    const copy = await prisma.copy.findUnique({ where: { id: copyId }, select: COPY_SELECT });
    return copy as CopySummary | null;
  },

  async listBySet(setId) {
    const copies = await prisma.copy.findMany({
      where: { setId },
      select: COPY_SELECT,
      orderBy: { acquiredAt: "asc" },
    });
    return copies as CopySummary[];
  },

  async listInventoryBySet(setId) {
    const copies = await prisma.copy.findMany({
      where: { setId },
      select: {
        ...COPY_SELECT,
        // El alquiler vivo, si lo hay: es de donde sale el nombre de quien la tiene.
        // `COMPLETED` queda fuera porque una copia devuelta ya no está en poder de
        // nadie, por mucho que su último alquiler siga en el historial.
        rentals: {
          where: { status: { not: "COMPLETED" } },
          select: { user: { select: { fullName: true } } },
          take: 1,
        },
      },
      orderBy: { acquiredAt: "asc" },
    });

    return copies.map(
      ({ rentals, ...copy }): InventoryCopy => ({
        ...(copy as CopySummary),
        holderName: rentals[0]?.user.fullName ?? null,
      })
    );
  },

  async create({ setId, acquiredAt }) {
    // Toda copia nace en INTAKE (PRD §15.5): es el estado inicial de la máquina, y el
    // `default` del modelo lo respalda.
    const copy = await prisma.copy.create({
      data: { setId, acquiredAt },
      select: COPY_SELECT,
    });
    return copy as CopySummary;
  },

  async transition({ copyId, toState, actorId, reason, at }): Promise<TransitionCopyOutcome> {
    // Transacción: el cambio de estado, su auditoría y la sincronización del alquiler
    // entran juntos o no entra ninguno.
    return prisma.$transaction(async (tx) => {
      const copy = await tx.copy.findUnique({
        where: { id: copyId },
        select: { state: true },
      });
      if (!copy) return { outcome: "not_found" as const };

      const fromState = copy.state as CopyState;
      if (!canTransition(fromState, toState)) {
        return { outcome: "invalid_transition" as const, fromState };
      }

      const applied = await applyTransition(tx, {
        copyId,
        fromState,
        toState,
        actorId,
        reason,
        at,
        copyData: toState === "BAJA" ? { retiredAt: at } : undefined,
      });
      if (!applied) return { outcome: "conflict" as const };

      return { outcome: "transitioned" as const, fromState };
    });
  },
};
