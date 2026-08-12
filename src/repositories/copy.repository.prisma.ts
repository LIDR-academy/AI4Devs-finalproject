import { prisma } from "@/db/prisma";
import { canTransition, type CopyState } from "@/domain/copy/lifecycle";
import type {
  CopyRepository,
  CopySummary,
  TransitionCopyOutcome,
} from "@/repositories/copy.repository";

/** Adaptador Prisma del puerto `CopyRepository`. */

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const COPY_SELECT = {
  id: true,
  setId: true,
  state: true,
  acquiredAt: true,
  retiredAt: true,
} as const;

/**
 * **Único camino** por el que cambia el estado de una copia.
 *
 * Une en un solo movimiento las dos cosas que nunca deben separarse: el
 * compare-and-swap de D12 y el registro de auditoría de PRD §7. Mientras todas las
 * transiciones pasen por aquí, es imposible dejar una copia en un estado nuevo sin
 * saber quién la movió — y como la firma exige `actorId`, tampoco cabe registrarla de
 * forma anónima.
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
    // Transacción: el cambio de estado y su auditoría entran juntos o no entra
    // ninguno. Una copia movida sin rastro de quién fue sería peor que no moverla.
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
        // La baja marca además la fecha de retirada; el resto de transiciones solo
        // cambian el estado.
        copyData: toState === "BAJA" ? { retiredAt: at } : undefined,
      });
      if (!applied) return { outcome: "conflict" as const };

      return { outcome: "transitioned" as const, fromState };
    });
  },
};
