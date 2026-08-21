import { prisma } from "@/db/prisma";
import type { CopyState } from "@/domain/copy/lifecycle";
import { placeInQueues } from "@/domain/reservation-queue/ordering";
import { OCCUPYING_COPY_STATES } from "@/domain/subscriptions/eligibility";
import { applyTransition } from "@/repositories/copy-transitions";
import type {
  CreatedOffer,
  PendingOffer,
  QueueEntryCandidate,
  QueueEntrySummary,
  QueueRepository,
} from "@/repositories/queue.repository";

/** Adaptador Prisma del puerto `QueueRepository`. */

const ENTRY_SELECT = {
  id: true,
  setId: true,
  userId: true,
  status: true,
  enqueuedAt: true,
  effectiveEntryAt: true,
  appliedBonus: true,
  priorityPenalty: true,
  set: { select: { name: true } },
} as const;

type EntryRow = {
  id: string;
  setId: string;
  userId: string;
  status: "WAITING" | "OFFERED" | "CONFIRMED" | "EXPIRED" | "LEFT";
  enqueuedAt: Date;
  effectiveEntryAt: Date;
  appliedBonus: number;
  priorityPenalty: number;
  set: { name: string };
};

function toEntry(row: EntryRow): QueueEntrySummary {
  return {
    id: row.id,
    setId: row.setId,
    setName: row.set.name,
    userId: row.userId,
    status: row.status,
    enqueuedAt: row.enqueuedAt,
    effectiveEntryAt: row.effectiveEntryAt,
    appliedBonusDays: row.appliedBonus,
    priorityPenaltyDays: row.priorityPenalty,
  };
}

const OFFER_SELECT = {
  id: true,
  queueEntryId: true,
  copyId: true,
  offeredAt: true,
  windowExpiresAt: true,
  reminderSentAt: true,
  queueEntry: { select: { userId: true, setId: true, set: { select: { name: true } } } },
} as const;

type OfferRow = {
  id: string;
  queueEntryId: string;
  copyId: string;
  offeredAt: Date;
  windowExpiresAt: Date;
  reminderSentAt: Date | null;
  queueEntry: { userId: string; setId: string; set: { name: string } };
};

function toOffer(row: OfferRow): PendingOffer {
  return {
    offerId: row.id,
    entryId: row.queueEntryId,
    userId: row.queueEntry.userId,
    copyId: row.copyId,
    setId: row.queueEntry.setId,
    setName: row.queueEntry.set.name,
    offeredAt: row.offeredAt,
    windowExpiresAt: row.windowExpiresAt,
    reminderSentAt: row.reminderSentAt,
  };
}

/** Estados en los que una entrada sigue "viva" y por tanto cuenta para el límite. */
const ACTIVE_ENTRY_STATUSES = ["WAITING", "OFFERED"] as const;

export const prismaQueueRepository: QueueRepository = {
  async countActiveQueuesForUser(userId) {
    return prisma.reservationQueueEntry.count({
      where: { userId, status: { in: [...ACTIVE_ENTRY_STATUSES] } },
    });
  },

  async findEntryForUserAndSet(userId, setId) {
    const row = await prisma.reservationQueueEntry.findFirst({
      where: { userId, setId, status: { in: [...ACTIVE_ENTRY_STATUSES] } },
      select: ENTRY_SELECT,
    });
    return row ? toEntry(row as EntryRow) : null;
  },

  async findEntryById(entryId) {
    const row = await prisma.reservationQueueEntry.findUnique({
      where: { id: entryId },
      select: ENTRY_SELECT,
    });
    return row ? toEntry(row as EntryRow) : null;
  },

  async listEntriesForUser(userId) {
    const rows = await prisma.reservationQueueEntry.findMany({
      where: { userId, status: { in: [...ACTIVE_ENTRY_STATUSES] } },
      select: ENTRY_SELECT,
      orderBy: { effectiveEntryAt: "asc" },
    });
    if (rows.length === 0) return [];

    // El puesto exige la cola entera de cada Set, no solo la entrada propia
    // (§8.4). Una segunda consulta acotada a esos Sets —unas pocas decenas de filas—
    // y el orden se resuelve con la misma función de dominio que sirve las ofertas,
    // en vez de repetir el criterio de D11 en SQL.
    const peers = await prisma.reservationQueueEntry.findMany({
      where: {
        setId: { in: [...new Set(rows.map((row) => row.setId))] },
        status: { in: [...ACTIVE_ENTRY_STATUSES] },
      },
      select: { id: true, setId: true, effectiveEntryAt: true },
    });
    const placements = placeInQueues(peers);

    return rows.map((row) => {
      const entry = toEntry(row as EntryRow);
      // La entrada acaba de salir de la misma tabla, así que siempre está en el mapa;
      // el respaldo evita un `!` y describe lo que significaría no estarlo.
      const placement = placements.get(entry.id) ?? { position: 1, queueLength: 1 };
      return { ...entry, ...placement };
    });
  },

  async countActiveEntriesForSet(setId) {
    return prisma.reservationQueueEntry.count({
      where: { setId, status: { in: [...ACTIVE_ENTRY_STATUSES] } },
    });
  },

  async createEntry({ setId, userId, enqueuedAt, appliedBonusDays, effectiveEntryAt }) {
    const row = await prisma.reservationQueueEntry.create({
      data: {
        setId,
        userId,
        status: "WAITING",
        enqueuedAt,
        appliedBonus: appliedBonusDays,
        effectiveEntryAt,
      },
      select: ENTRY_SELECT,
    });
    return toEntry(row as EntryRow);
  },

  async leaveQueue(entryId) {
    // Condicionado al estado: si ya tenía una oferta en marcha, abandonar no puede
    // dejar la copia bloqueada sin cerrarla antes.
    const { count } = await prisma.reservationQueueEntry.updateMany({
      where: { id: entryId, status: "WAITING" },
      data: { status: "LEFT" },
    });
    return count > 0;
  },

  async findPendingOffer(offerId) {
    const row = await prisma.reservationOffer.findFirst({
      where: { id: offerId, status: "PENDING" },
      select: OFFER_SELECT,
    });
    return row ? toOffer(row as OfferRow) : null;
  },

  async acceptOffer({ offerId, at, subscriptionId, shippingAddress }) {
    try {
      return await prisma.$transaction(async (tx) => {
        const offer = await tx.reservationOffer.findFirst({
          where: { id: offerId, status: "PENDING" },
          select: OFFER_SELECT,
        });
        if (!offer) return null;
        // Caducada aunque el barrido aún no haya pasado: el reloj manda sobre el job.
        if (offer.windowExpiresAt.getTime() <= at.getTime()) return null;

        const applied = await applyTransition(tx, {
          copyId: offer.copyId,
          fromState: "OFRECIDA",
          toState: "ALQUILADA",
          actorId: offer.queueEntry.userId,
          reason: "Oferta de cola aceptada",
          at,
        });
        if (!applied) return null;

        const rental = await tx.rental.create({
          data: {
            copyId: offer.copyId,
            userId: offer.queueEntry.userId,
            subscriptionId,
            type: "SUBSCRIPTION",
            status: "ACTIVE",
            shippingAddress: shippingAddress as never,
            startedAt: at,
          },
          select: { id: true },
        });

        await tx.reservationOffer.updateMany({
          where: { id: offerId, status: "PENDING" },
          data: { status: "ACCEPTED", respondedAt: at, rentalId: rental.id },
        });
        await tx.reservationQueueEntry.updateMany({
          where: { id: offer.queueEntryId },
          data: { status: "CONFIRMED" },
        });

        return { rentalId: rental.id };
      });
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  },

  async closeOffer({ offerId, outcome, at, requeue }) {
    return prisma.$transaction(async (tx) => {
      const offer = await tx.reservationOffer.findFirst({
        where: { id: offerId, status: "PENDING" },
        select: OFFER_SELECT,
      });
      if (!offer) return null;

      const { count } = await tx.reservationOffer.updateMany({
        where: { id: offerId, status: "PENDING" },
        data: { status: outcome, respondedAt: at },
      });
      // Otro proceso la cerró primero (p. ej. el barrido y el rechazo a la vez).
      if (count === 0) return null;

      // La copia vuelve a estar libre en el acto: es lo que permite ofrecerla al
      // siguiente sin esperar al vencimiento (D5).
      await applyTransition(tx, {
        copyId: offer.copyId,
        fromState: "OFRECIDA",
        toState: "DISPONIBLE",
        actorId: offer.queueEntry.userId,
        reason: outcome === "REJECTED" ? "Oferta rechazada" : "Oferta caducada",
        at,
      });

      await tx.reservationQueueEntry.updateMany({
        where: { id: offer.queueEntryId },
        data: requeue
          ? {
              // Caducidad: vuelve al final con prioridad reducida, no se le expulsa.
              status: "WAITING",
              effectiveEntryAt: requeue.effectiveEntryAt,
              priorityPenalty: requeue.penaltyDays,
            }
          : // Rechazo explícito: dijo que no, así que sale de la cola.
            { status: "LEFT" },
      });

      return { copyId: offer.copyId, setId: offer.queueEntry.setId };
    });
  },

  async findExpiredOffers(now) {
    const rows = await prisma.reservationOffer.findMany({
      where: { status: "PENDING", windowExpiresAt: { lte: now } },
      select: OFFER_SELECT,
      orderBy: { windowExpiresAt: "asc" },
    });
    return rows.map((row) => toOffer(row as OfferRow));
  },

  async findOffersNeedingReminder(now) {
    // El filtro fino (¿ha pasado ya la mitad?) es del dominio; aquí solo se acota a
    // las que siguen vivas y aún no tienen recordatorio.
    const rows = await prisma.reservationOffer.findMany({
      where: { status: "PENDING", reminderSentAt: null, windowExpiresAt: { gt: now } },
      select: OFFER_SELECT,
    });
    return rows.map((row) => toOffer(row as OfferRow));
  },

  async markReminderSent(offerId, at) {
    await prisma.reservationOffer.updateMany({
      where: { id: offerId },
      data: { reminderSentAt: at },
    });
  },

  async findWaitingEntries(setId) {
    const entries = await prisma.reservationQueueEntry.findMany({
      where: { setId, status: "WAITING" },
      // Orden de servicio de D11: menor entrada efectiva primero, desempate por id.
      orderBy: [{ effectiveEntryAt: "asc" }, { id: "asc" }],
      select: {
        id: true,
        userId: true,
        setId: true,
        effectiveEntryAt: true,
        set: { select: { name: true } },
      },
    });
    if (entries.length === 0) return [];

    const userIds = entries.map((entry) => entry.userId);

    const [subscriptions, rentals] = await Promise.all([
      prisma.subscription.findMany({
        where: { userId: { in: userIds }, status: { not: "CANCELLED" } },
        select: {
          userId: true,
          status: true,
          startedAt: true,
          plan: { select: { maxSimultaneousSets: true } },
        },
        orderBy: { startedAt: "desc" },
      }),
      prisma.rental.findMany({
        where: {
          userId: { in: userIds },
          status: { not: "COMPLETED" },
          copy: { state: { in: [...OCCUPYING_COPY_STATES] } },
        },
        select: { userId: true, copy: { select: { state: true } } },
      }),
    ]);

    const subscriptionByUser = new Map<string, (typeof subscriptions)[number]>();
    for (const subscription of subscriptions) {
      // `orderBy` descendente: la primera que se ve de cada usuario es la más reciente.
      if (!subscriptionByUser.has(subscription.userId)) {
        subscriptionByUser.set(subscription.userId, subscription);
      }
    }

    const statesByUser = new Map<string, CopyState[]>();
    for (const rental of rentals) {
      const states = statesByUser.get(rental.userId) ?? [];
      states.push(rental.copy.state as CopyState);
      statesByUser.set(rental.userId, states);
    }

    return entries.map((entry): QueueEntryCandidate => {
      const subscription = subscriptionByUser.get(entry.userId);
      return {
        entryId: entry.id,
        userId: entry.userId,
        setId: entry.setId,
        setName: entry.set.name,
        effectiveEntryAt: entry.effectiveEntryAt,
        subscription: subscription
          ? {
              status: subscription.status,
              startedAt: subscription.startedAt,
              maxSimultaneousSets: subscription.plan.maxSimultaneousSets,
            }
          : null,
        currentCopyStates: statesByUser.get(entry.userId) ?? [],
      };
    });
  },

  async offerCopyTo({ entryId, copyId, userId, windowExpiresAt, at }): Promise<CreatedOffer | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        // La copia pasa a OFRECIDA con el mismo CAS y la misma auditoría que
        // cualquier otra transición.
        const applied = await applyTransition(tx, {
          copyId,
          fromState: "DISPONIBLE",
          toState: "OFRECIDA",
          actorId: userId,
          reason: "Ofrecida al cabeza de cola",
          at,
        });
        if (!applied) return null;

        const offer = await tx.reservationOffer.create({
          data: {
            queueEntryId: entryId,
            copyId,
            status: "PENDING",
            offeredAt: at,
            windowExpiresAt,
          },
          select: { id: true },
        });

        await tx.reservationQueueEntry.updateMany({
          // Condicionado a que siga en espera: si otra oferta se le adelantó, esta no
          // debe pisarla.
          where: { id: entryId, status: "WAITING" },
          data: { status: "OFFERED" },
        });

        return { offerId: offer.id, entryId, userId, copyId, windowExpiresAt };
      });
    } catch (error) {
      // El índice único parcial de D12 ("una oferta activa por copia") es la última
      // palabra: si otro proceso creó la oferta primero, esta pierde y no es un error
      // que deba propagarse.
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  },
};

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  );
}
