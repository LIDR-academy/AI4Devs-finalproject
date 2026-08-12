import type { prisma } from "@/db/prisma";
import type { CopyState } from "@/domain/copy/lifecycle";

/** Cliente dentro de una transacción de Prisma. */
export type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * **Único camino** por el que cambia el estado de una copia.
 *
 * Une en un solo movimiento las tres cosas que nunca deben separarse:
 *
 *  1. el **compare-and-swap** de D12 —la escritura solo prospera si el estado sigue
 *     siendo el que se leyó—,
 *  2. el registro de **auditoría** de PRD §7, con su autor obligatorio,
 *  3. la **sincronización del alquiler** asociado, si lo hay.
 *
 * Ese tercer punto es lo que evita que el estado del `Rental` y el de la `Copy` se
 * separen: al derivarse uno del otro dentro de la misma transacción, no existe el
 * instante en que la copia ya volvió pero el alquiler sigue diciendo que está fuera.
 *
 * Devuelve `false` si la precondición de estado falló; quien llama decide qué error de
 * dominio corresponde.
 */
export async function applyTransition(
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

  await syncRentalWithCopyState(tx, input);

  return true;
}

/**
 * Traduce el nuevo estado de la copia al del alquiler abierto, si existe.
 *
 * Solo hay tres momentos en que el alquiler cambia; el resto de transiciones (alta,
 * incompleta, higienización…) no le afectan y por eso no aparecen aquí.
 */
async function syncRentalWithCopyState(
  tx: Tx,
  input: { copyId: string; toState: CopyState; at: Date }
): Promise<void> {
  const data = rentalUpdateFor(input.toState, input.at);
  if (!data) return;

  await tx.rental.updateMany({
    // Solo el alquiler vivo de esa copia: los ya completados son historia y no se tocan.
    where: { copyId: input.copyId, status: { not: "COMPLETED" } },
    data,
  });
}

function rentalUpdateFor(toState: CopyState, at: Date): Record<string, unknown> | null {
  switch (toState) {
    case "EN_DEVOLUCION":
      return { status: "RETURN_INITIATED", returnInitiatedAt: at };
    case "EN_INSPECCION":
      return { status: "IN_INSPECTION", receivedAt: at };
    case "DISPONIBLE":
    case "BAJA":
      // El alquiler se cierra cuando la copia vuelve a circulación o se retira: hasta
      // ese momento sigue ocupando plaza del plan (spec `subscriptions`).
      return { status: "COMPLETED", completedAt: at };
    default:
      return null;
  }
}
