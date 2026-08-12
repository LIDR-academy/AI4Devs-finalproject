import type { CopyState } from "@/domain/copy/lifecycle";

/** Puerto de la cola de reservas (capability `reservation-queue`). */

/** Una entrada de cola con lo necesario para decidir si se le puede ofrecer. */
export interface QueueEntryCandidate {
  entryId: string;
  userId: string;
  setId: string;
  effectiveEntryAt: Date;
  /** Situación del usuario, para saltar a quien no sea elegible ahora mismo (D5). */
  subscription: {
    status: "ACTIVE" | "PAUSED" | "CANCELLED";
    startedAt: Date;
    maxSimultaneousSets: number;
  } | null;
  currentCopyStates: readonly CopyState[];
}

export interface CreatedOffer {
  offerId: string;
  entryId: string;
  userId: string;
  copyId: string;
  windowExpiresAt: Date;
}

export interface QueueRepository {
  /**
   * Entradas en espera de un Set, **en orden de servicio**: `effectiveEntryAt` y, en
   * empate, `id` (D11). El orden se resuelve en la consulta porque es el mismo índice
   * que sostiene la política de cola.
   */
  findWaitingEntries(setId: string): Promise<readonly QueueEntryCandidate[]>;

  /**
   * Crea la oferta y mueve la copia a `OFRECIDA` en una transacción.
   *
   * Devuelve `null` si la copia dejó de estar disponible o si ya tenía una oferta
   * activa — el índice único parcial de D12 impide que coexistan dos.
   */
  offerCopyTo(input: {
    entryId: string;
    copyId: string;
    userId: string;
    windowExpiresAt: Date;
    at: Date;
  }): Promise<CreatedOffer | null>;
}
