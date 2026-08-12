import { can } from "@/domain/auth/permissions";
import type { Role } from "@/domain/auth/roles";
import { assertTransition, type CopyState } from "@/domain/copy/lifecycle";
import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
} from "@/domain/errors";
import type { CopyRepository } from "@/repositories/copy.repository";

export interface TransitionCopyDeps {
  repository: CopyRepository;
  now?: () => Date;
}

export interface TransitionCopyInput {
  copyId: string;
  toState: CopyState;
  actor: { id: string; role: Role };
  reason?: string | null;
}

export interface TransitionCopyResult {
  copyId: string;
  fromState: CopyState;
  toState: CopyState;
}

/**
 * Mueve una copia por su ciclo de vida (PRD §15.5).
 *
 * El orden importa: primero se lee el estado, con él se identifica **qué** transición
 * se pide, y solo entonces se comprueba el permiso. No se puede validar antes, porque
 * el permiso depende del par origen→destino: recepcionar una devolución lo hace un
 * operador, pero dar de baja solo un admin.
 *
 * Entre esa lectura y la escritura cabe una carrera, pero el CAS del repositorio se
 * condiciona al mismo estado leído: si cambió, la escritura no prospera. Así la
 * transición que se ejecuta es siempre aquella para la que se validó el permiso.
 */
export async function transitionCopy(
  { repository, now = () => new Date() }: TransitionCopyDeps,
  input: TransitionCopyInput
): Promise<TransitionCopyResult> {
  const copy = await repository.findById(input.copyId);
  if (!copy) throw new NotFoundError("La copia no existe.");

  const transition = assertTransition(copy.state, input.toState);

  if (transition.driver === "system" || transition.permission === null) {
    // Estas las provocan los flujos de alquiler y cola (bloques 5-6). Permitir que
    // alguien las dispare a mano dejaría, por ejemplo, una copia en ALQUILADA sin
    // ningún alquiler detrás.
    throw new ForbiddenError(
      `La transición «${transition.label}» la provoca el sistema, no se ejecuta a mano.`
    );
  }

  if (!can(input.actor.role, transition.permission)) {
    throw new ForbiddenError("Tu rol no permite realizar esta transición.");
  }

  const result = await repository.transition({
    copyId: input.copyId,
    toState: input.toState,
    actorId: input.actor.id,
    reason: input.reason?.trim() || null,
    at: now(),
  });

  switch (result.outcome) {
    case "transitioned":
      return {
        copyId: input.copyId,
        fromState: result.fromState,
        toState: input.toState,
      };
    case "not_found":
      throw new NotFoundError("La copia no existe.");
    case "invalid_transition":
      throw new InvariantViolationError(
        "COPY_STATE_CONFLICT",
        `Una copia en ${result.fromState} no puede pasar a ${input.toState}.`
      );
    case "conflict":
      throw new InvariantViolationError(
        "COPY_STATE_CONFLICT",
        "El estado de la copia ha cambiado; vuelve a intentarlo."
      );
  }
}
