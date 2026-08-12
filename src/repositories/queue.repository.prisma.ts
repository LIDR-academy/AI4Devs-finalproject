import { prisma } from "@/db/prisma";
import type { CopyState } from "@/domain/copy/lifecycle";
import { OCCUPYING_COPY_STATES } from "@/domain/subscriptions/eligibility";
import { applyTransition } from "@/repositories/copy-transitions";
import type {
  CreatedOffer,
  QueueEntryCandidate,
  QueueRepository,
} from "@/repositories/queue.repository";

/** Adaptador Prisma del puerto `QueueRepository`. */
export const prismaQueueRepository: QueueRepository = {
  async findWaitingEntries(setId) {
    const entries = await prisma.reservationQueueEntry.findMany({
      where: { setId, status: "WAITING" },
      // Orden de servicio de D11: menor entrada efectiva primero, desempate por id.
      orderBy: [{ effectiveEntryAt: "asc" }, { id: "asc" }],
      select: { id: true, userId: true, setId: true, effectiveEntryAt: true },
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
