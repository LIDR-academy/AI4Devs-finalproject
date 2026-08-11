import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import type { CopyState } from "@/domain/copy/lifecycle";
import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
} from "@/domain/errors";
import type { CopyRepository } from "@/repositories/copy.repository";

export interface RetireCopyDeps {
  repository: CopyRepository;
  now?: () => Date;
}

export interface RetireCopyInput {
  copyId: string;
  actor: { id: string; role: Role };
  /** Causa de la baja: daño irreparable, pérdida o sustracción (HU-15). */
  reason: string;
}

export interface RetireCopyResult {
  copyId: string;
  fromState: CopyState;
}

/**
 * Da de baja una copia — **solo ADMIN** (D6, HU-15).
 *
 * El permiso se comprueba aquí y no solo en el borde HTTP: este caso de uso también
 * es invocable desde el scheduler o desde otro caso de uso, donde no hay handler que
 * haya filtrado nada. La comprobación del handler es la primera barrera; esta es la
 * que no se puede rodear.
 */
export async function retireCopy(
  { repository, now = () => new Date() }: RetireCopyDeps,
  input: RetireCopyInput
): Promise<RetireCopyResult> {
  if (!can(input.actor.role, "copy.retire")) {
    // El operador detecta y marca la copia como incompleta o dañada; confirmar la
    // baja —que tiene impacto económico— es del admin.
    throw new ForbiddenError("Solo un administrador puede dar de baja una copia.");
  }

  const result = await repository.retire({
    copyId: input.copyId,
    actorId: input.actor.id,
    reason: input.reason,
    at: now(),
  });

  switch (result.outcome) {
    case "retired":
      return { copyId: input.copyId, fromState: result.fromState };
    case "not_found":
      throw new NotFoundError("La copia no existe.");
    case "already_retired":
      throw new InvariantViolationError(
        "COPY_STATE_CONFLICT",
        "La copia ya está dada de baja."
      );
    case "conflict":
      throw new InvariantViolationError(
        "COPY_STATE_CONFLICT",
        "El estado de la copia ha cambiado; vuelve a intentarlo."
      );
  }
}
