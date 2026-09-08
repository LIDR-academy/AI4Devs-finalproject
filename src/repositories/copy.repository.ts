import type { CopyState } from "@/domain/copy/lifecycle";

/** Puerto de persistencia de las copias (capability `catalog-inventory`). */

export interface CopySummary {
  id: string;
  setId: string;
  state: CopyState;
  acquiredAt: Date;
  retiredAt: Date | null;
}

/**
 * Resultado de una transición. Tipo **discriminado** en vez de excepciones porque
 * cada desenlace se traduce a una respuesta HTTP distinta y quien decide eso es el
 * caso de uso, no el repositorio.
 */
export type TransitionCopyOutcome =
  | { outcome: "transitioned"; fromState: CopyState }
  | { outcome: "not_found" }
  /** El estado leído no admite esa transición (tabla de PRD §15.5). */
  | { outcome: "invalid_transition"; fromState: CopyState }
  /** Otro proceso cambió el estado entre la lectura y la escritura (CAS, D12). */
  | { outcome: "conflict" };

/**
 * Copia vista desde el inventario del back-office (`wireframes.md` §6.2): lo mismo
 * que `CopySummary` **más quién la tiene**, que es el dato que convierte una fila
 * "Alquilada" en una respuesta a "¿dónde está esta copia?".
 */
export interface InventoryCopy extends CopySummary {
  /** Nombre del suscriptor con el alquiler vivo; `null` si no está fuera. */
  holderName: string | null;
}

export interface CopyRepository {
  findById(copyId: string): Promise<CopySummary | null>;

  listBySet(setId: string): Promise<readonly CopySummary[]>;

  /** Inventario de un Set con el tenedor de cada copia. Vista de back-office. */
  listInventoryBySet(setId: string): Promise<readonly InventoryCopy[]>;

  create(input: { setId: string; acquiredAt: Date }): Promise<CopySummary>;

  /**
   * Mueve una copia de estado de forma **atómica y condicionada al estado leído**
   * (compare-and-swap, D12), registrando la transición con su autor en el mismo
   * movimiento: una copia nunca cambia de estado sin dejar rastro de quién la movió.
   */
  transition(input: {
    copyId: string;
    toState: CopyState;
    actorId: string;
    reason: string | null;
    at: Date;
  }): Promise<TransitionCopyOutcome>;
}
