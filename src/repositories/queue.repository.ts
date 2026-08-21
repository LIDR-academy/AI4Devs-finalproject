import type { CopyState } from "@/domain/copy/lifecycle";

/** Puerto de la cola de reservas (capability `reservation-queue`). */

/** Una entrada de cola con lo necesario para decidir si se le puede ofrecer. */
export interface QueueEntryCandidate {
  entryId: string;
  userId: string;
  setId: string;
  /** Nombre del Set, para el texto del aviso «te toca». */
  setName: string;
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

export interface QueueEntrySummary {
  id: string;
  setId: string;
  setName: string;
  userId: string;
  status: "WAITING" | "OFFERED" | "CONFIRMED" | "EXPIRED" | "LEFT";
  enqueuedAt: Date;
  effectiveEntryAt: Date;
  appliedBonusDays: number;
  priorityPenaltyDays: number;
}

/**
 * La misma entrada vista **por su dueño**, con el puesto que ocupa
 * (`wireframes.md` §8.4). Es una proyección aparte y no un par de campos en
 * `QueueEntrySummary` porque calcular el puesto obliga a leer la cola entera del Set:
 * quien crea una entrada o la busca por id no debe pagar esa consulta.
 */
export interface QueueEntryPlacement extends QueueEntrySummary {
  /** 1-based dentro de la cola de su Set, con el mismo orden que sirve las ofertas (D11). */
  position: number;
  queueLength: number;
}

export interface PendingOffer {
  offerId: string;
  entryId: string;
  userId: string;
  copyId: string;
  setId: string;
  setName: string;
  offeredAt: Date;
  windowExpiresAt: Date;
  reminderSentAt: Date | null;
}

export interface QueueRepository {
  // ── Encolado ─────────────────────────────────────────────────────────────
  countActiveQueuesForUser(userId: string): Promise<number>;
  findEntryForUserAndSet(userId: string, setId: string): Promise<QueueEntrySummary | null>;
  findEntryById(entryId: string): Promise<QueueEntrySummary | null>;
  /** Colas vivas del usuario, cada una con su puesto (§8.4). */
  listEntriesForUser(userId: string): Promise<readonly QueueEntryPlacement[]>;

  /**
   * Cuánta gente espera un Set. Mismo criterio que el `queueLength` con el que se
   * deciden los recordatorios de retención (D7): esperando **u** ofrecida.
   */
  countActiveEntriesForSet(setId: string): Promise<number>;

  createEntry(input: {
    setId: string;
    userId: string;
    enqueuedAt: Date;
    appliedBonusDays: number;
    effectiveEntryAt: Date;
  }): Promise<QueueEntrySummary>;

  /** Abandono voluntario. Devuelve `false` si la entrada ya no estaba en espera. */
  leaveQueue(entryId: string): Promise<boolean>;

  // ── Ofertas ──────────────────────────────────────────────────────────────
  findPendingOffer(offerId: string): Promise<PendingOffer | null>;

  /**
   * Acepta la oferta: la copia pasa a `ALQUILADA`, se abre el alquiler y la entrada
   * sale de la cola. Todo en una transacción; `null` si la oferta ya no era válida.
   */
  acceptOffer(input: {
    offerId: string;
    at: Date;
    subscriptionId: string | null;
    shippingAddress: Record<string, unknown>;
  }): Promise<{ rentalId: string } | null>;

  /**
   * Rechazo explícito o caducidad: la oferta se cierra y la copia vuelve a
   * `DISPONIBLE` para el siguiente. En la caducidad, además, la entrada **vuelve a la
   * cola** con su nueva entrada efectiva penalizada (D5).
   */
  closeOffer(input: {
    offerId: string;
    outcome: "REJECTED" | "EXPIRED";
    at: Date;
    requeue: { effectiveEntryAt: Date; penaltyDays: number } | null;
  }): Promise<{ copyId: string; setId: string } | null>;

  /** Ofertas vencidas sin respuesta, para el barrido del scheduler. */
  findExpiredOffers(now: Date): Promise<readonly PendingOffer[]>;

  /** Ofertas que ya pasaron la mitad de su ventana y aún no tienen recordatorio. */
  findOffersNeedingReminder(now: Date): Promise<readonly PendingOffer[]>;

  markReminderSent(offerId: string, at: Date): Promise<void>;

  // ── Orden de servicio ────────────────────────────────────────────────────
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
