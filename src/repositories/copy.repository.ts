import type { CopyState } from "@/domain/copy/lifecycle";

/** Puerto de persistencia de las copias (capability `catalog-inventory`). */

/**
 * Resultado de una retirada. Es un tipo **discriminado** en vez de excepciones
 * porque cada desenlace se traduce a una respuesta HTTP distinta y quien decide eso
 * es el caso de uso, no el repositorio.
 */
export type RetireCopyOutcome =
  | { outcome: "retired"; fromState: CopyState }
  | { outcome: "not_found" }
  /** Ya estaba de baja: la precondición no se cumple de entrada. */
  | { outcome: "already_retired" }
  /** Otro proceso cambió el estado entre la lectura y la escritura (CAS, D12). */
  | { outcome: "conflict" };

export interface CopyRepository {
  /**
   * Transita una copia a `BAJA` de forma **atómica y condicionada al estado leído**
   * (compare-and-swap, D12), registrando la transición con su autor en el mismo
   * movimiento: la copia nunca queda retirada sin su rastro de auditoría.
   */
  retire(input: {
    copyId: string;
    actorId: string;
    reason: string;
    at: Date;
  }): Promise<RetireCopyOutcome>;
}
