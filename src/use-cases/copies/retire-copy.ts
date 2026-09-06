import type { CopyState } from "@/domain/copy/lifecycle";

import {
  transitionCopy,
  type TransitionCopyDeps,
  type TransitionCopyInput,
} from "./transition-copy";

export type RetireCopyDeps = TransitionCopyDeps;

export interface RetireCopyInput {
  copyId: string;
  actor: TransitionCopyInput["actor"];
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
 * Es la transición a `BAJA` de la máquina de estados, no un camino aparte: pasa por
 * la misma tabla, el mismo CAS y la misma auditoría que el resto. Se conserva como
 * caso de uso propio porque la baja tiene endpoint y semántica propios, pero toda la
 * lógica —incluido que solo se puede retirar desde `EN_INSPECCION`, `INCOMPLETA` o
 * `ALQUILADA`— vive en un único sitio.
 */
export async function retireCopy(
  deps: RetireCopyDeps,
  input: RetireCopyInput
): Promise<RetireCopyResult> {
  const result = await transitionCopy(deps, {
    copyId: input.copyId,
    toState: "BAJA",
    actor: input.actor,
    reason: input.reason,
  });

  return { copyId: result.copyId, fromState: result.fromState };
}
