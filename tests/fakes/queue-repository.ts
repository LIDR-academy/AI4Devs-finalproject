import type { CopyState } from "@/domain/copy/lifecycle";
import { placeInQueues } from "@/domain/reservation-queue/ordering";
import type {
  CreatedOffer,
  PendingOffer,
  QueueEntryCandidate,
  QueueEntrySummary,
  QueueRepository,
} from "@/repositories/queue.repository";

interface Entry extends QueueEntrySummary {
  subscription: QueueEntryCandidate["subscription"];
  currentCopyStates: CopyState[];
}

interface Offer extends PendingOffer {
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
}

/** Doble en memoria del puerto `QueueRepository`. */
export class FakeQueueRepository implements QueueRepository {
  readonly entries: Entry[] = [];
  readonly offers: Offer[] = [];
  /** Estado de las copias, para reproducir el CAS del adaptador real. */
  readonly copyStates = new Map<string, CopyState>();
  private sequence = 0;

  async countActiveQueuesForUser(userId: string) {
    return this.entries.filter(
      (e) => e.userId === userId && (e.status === "WAITING" || e.status === "OFFERED")
    ).length;
  }

  async findEntryForUserAndSet(userId: string, setId: string) {
    return (
      this.entries.find(
        (e) =>
          e.userId === userId &&
          e.setId === setId &&
          (e.status === "WAITING" || e.status === "OFFERED")
      ) ?? null
    );
  }

  async findEntryById(entryId: string) {
    return this.entries.find((e) => e.id === entryId) ?? null;
  }

  async listEntriesForUser(userId: string) {
    // El puesto se calcula con la misma función de dominio que el adaptador real: si
    // el doble contase por su cuenta, los tests validarían otra cola (§8.4).
    const placements = placeInQueues(
      this.entries.filter((e) => e.status === "WAITING" || e.status === "OFFERED")
    );
    return this.entries
      .filter((e) => e.userId === userId && (e.status === "WAITING" || e.status === "OFFERED"))
      .map((entry) => ({
        ...entry,
        ...(placements.get(entry.id) ?? { position: 1, queueLength: 1 }),
      }));
  }

  async countActiveEntriesForSet(setId: string) {
    return this.entries.filter(
      (e) => e.setId === setId && (e.status === "WAITING" || e.status === "OFFERED")
    ).length;
  }

  async createEntry(input: {
    setId: string;
    userId: string;
    enqueuedAt: Date;
    appliedBonusDays: number;
    effectiveEntryAt: Date;
  }) {
    const entry: Entry = {
      id: `entry-${++this.sequence}`,
      setId: input.setId,
      setName: "Set de prueba",
      userId: input.userId,
      status: "WAITING",
      enqueuedAt: input.enqueuedAt,
      effectiveEntryAt: input.effectiveEntryAt,
      appliedBonusDays: input.appliedBonusDays,
      priorityPenaltyDays: 0,
      subscription: null,
      currentCopyStates: [],
    };
    this.entries.push(entry);
    return entry;
  }

  async leaveQueue(entryId: string) {
    const entry = this.entries.find((e) => e.id === entryId && e.status === "WAITING");
    if (!entry) return false;
    entry.status = "LEFT";
    return true;
  }

  async findWaitingEntries(setId: string) {
    return this.entries
      .filter((e) => e.setId === setId && e.status === "WAITING")
      .sort(
        (a, b) =>
          a.effectiveEntryAt.getTime() - b.effectiveEntryAt.getTime() || a.id.localeCompare(b.id)
      )
      .map(
        (e): QueueEntryCandidate => ({
          entryId: e.id,
          userId: e.userId,
          setId: e.setId,
          setName: e.setName,
          effectiveEntryAt: e.effectiveEntryAt,
          subscription: e.subscription,
          currentCopyStates: e.currentCopyStates,
        })
      );
  }

  async offerCopyTo(input: {
    entryId: string;
    copyId: string;
    userId: string;
    windowExpiresAt: Date;
    at: Date;
  }): Promise<CreatedOffer | null> {
    // CAS: la copia tiene que seguir disponible.
    if (this.copyStates.get(input.copyId) !== "DISPONIBLE") return null;
    this.copyStates.set(input.copyId, "OFRECIDA");

    const entry = this.entries.find((e) => e.id === input.entryId);
    if (entry) entry.status = "OFFERED";

    const offer: Offer = {
      offerId: `offer-${++this.sequence}`,
      entryId: input.entryId,
      userId: input.userId,
      copyId: input.copyId,
      setId: entry?.setId ?? "set-1",
      setName: "Set de prueba",
      offeredAt: input.at,
      windowExpiresAt: input.windowExpiresAt,
      reminderSentAt: null,
      status: "PENDING",
    };
    this.offers.push(offer);
    return {
      offerId: offer.offerId,
      entryId: offer.entryId,
      userId: offer.userId,
      copyId: offer.copyId,
      windowExpiresAt: offer.windowExpiresAt,
    };
  }

  async findPendingOffer(offerId: string) {
    return this.offers.find((o) => o.offerId === offerId && o.status === "PENDING") ?? null;
  }

  async acceptOffer({ offerId, at }: { offerId: string; at: Date }) {
    const offer = this.offers.find((o) => o.offerId === offerId && o.status === "PENDING");
    if (!offer) return null;
    if (offer.windowExpiresAt.getTime() <= at.getTime()) return null;

    offer.status = "ACCEPTED";
    this.copyStates.set(offer.copyId, "ALQUILADA");
    const entry = this.entries.find((e) => e.id === offer.entryId);
    if (entry) entry.status = "CONFIRMED";
    return { rentalId: `rental-${++this.sequence}` };
  }

  async closeOffer({
    offerId,
    outcome,
    requeue,
  }: {
    offerId: string;
    outcome: "REJECTED" | "EXPIRED";
    at: Date;
    requeue: { effectiveEntryAt: Date; penaltyDays: number } | null;
  }) {
    const offer = this.offers.find((o) => o.offerId === offerId && o.status === "PENDING");
    if (!offer) return null;

    offer.status = outcome;
    this.copyStates.set(offer.copyId, "DISPONIBLE");

    const entry = this.entries.find((e) => e.id === offer.entryId);
    if (entry) {
      if (requeue) {
        entry.status = "WAITING";
        entry.effectiveEntryAt = requeue.effectiveEntryAt;
        entry.priorityPenaltyDays = requeue.penaltyDays;
      } else {
        entry.status = "LEFT";
      }
    }

    return { copyId: offer.copyId, setId: offer.setId };
  }

  async findExpiredOffers(now: Date) {
    return this.offers.filter(
      (o) => o.status === "PENDING" && o.windowExpiresAt.getTime() <= now.getTime()
    );
  }

  async findOffersNeedingReminder(now: Date) {
    return this.offers.filter(
      (o) =>
        o.status === "PENDING" &&
        o.reminderSentAt === null &&
        o.windowExpiresAt.getTime() > now.getTime()
    );
  }

  async markReminderSent(offerId: string, at: Date) {
    const offer = this.offers.find((o) => o.offerId === offerId);
    if (offer) offer.reminderSentAt = at;
  }
}
