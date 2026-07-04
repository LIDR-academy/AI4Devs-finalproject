import { ConflictException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Decimal } from "@prisma/client/runtime/library";
import type { PantryItem } from "@prisma/client";
import { MetricsService } from "../../common/metrics/metrics.service";
import { PrismaService } from "../../database/prisma.service";
import { PointsService } from "../gamification/points.service";
import { UsersService } from "../users/users.service";
import { CreatePantryItemDto } from "./dto/create-pantry-item.dto";
import { PantryConsumptionEventType, RegisterConsumptionEventDto } from "./dto/register-consumption-event.dto";
import { UpdatePantryItemDto } from "./dto/update-pantry-item.dto";
import {
  compareUseNextCandidates,
  daysUntilExpiration,
  riskFromDays,
  type UseNextCandidate,
} from "./pantry.ranking";

const FAR_PAST_EXPIRY_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
export const DEFAULT_AUTO_EXPIRY_THRESHOLD_DAYS = 14;
export const AUTO_EXPIRY_GRACE_DAYS = 7;
export const AUTO_EXPIRED_METHOD = "AUTO_EXPIRED";

export interface ExpiredCandidate {
  id: string;
  name: string;
  expirationDate: Date;
  daysExpired: number;
  estimatedValueEur: number | null;
}

export interface ExpiredCandidatesView {
  items: ExpiredCandidate[];
  digestId: string | null;
}

/**
 * Builds the `ConsumptionEvent` create payload for wasting a pantry item, snapshotting the item's
 * fields exactly as `registerEvent` does. `method` is `null` for user-initiated waste and
 * `AUTO_EXPIRED` for the automatic auto-resolve pass.
 */
export function buildWasteEventData(
  userId: string,
  item: Pick<
    PantryItem,
    "id" | "name" | "unit" | "quantity" | "expirationDate" | "pricePaid" | "notes"
  >,
  method: string | null,
) {
  const estimatedValueEur = computeEstimatedValue(item.pricePaid, item.quantity, item.quantity);
  return {
    pantryItemId: item.id,
    userId,
    type: "WASTED" as const,
    quantity: item.quantity,
    itemName: item.name,
    itemUnit: item.unit,
    ...(item.expirationDate && { itemExpirationDate: item.expirationDate }),
    ...(item.pricePaid !== null && { itemPricePaid: item.pricePaid }),
    ...(item.notes && { itemNotes: item.notes }),
    ...(estimatedValueEur !== null && { estimatedValueEur }),
    ...(method && { method }),
  };
}

export interface UseNextItem {
  pantryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePaid: string | null;
  expirationDate: string | null;
  daysUntilExpiration: number | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface UseNextResponse {
  items: UseNextItem[];
}

export function computeEstimatedValue(
  pricePaid: Decimal | null,
  originalQuantity: number,
  eventQuantity: number,
): number | null {
  if (!pricePaid || originalQuantity <= 0 || eventQuantity <= 0) {
    return null;
  }
  return (parseFloat(pricePaid.toString()) / originalQuantity) * eventQuantity;
}

export function daysPastExpiry(expirationDate: Date, now: Date): number {
  const startOfExpiry = Date.UTC(
    expirationDate.getUTCFullYear(),
    expirationDate.getUTCMonth(),
    expirationDate.getUTCDate(),
  );
  const startOfNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((startOfNow - startOfExpiry) / (1000 * 60 * 60 * 24));
}

export function isFarPastExpiry(item: Pick<PantryItem, "expirationDate">, now: Date): boolean {
  if (!item.expirationDate) {
    return false;
  }
  return daysPastExpiry(item.expirationDate, now) >= FAR_PAST_EXPIRY_DAYS;
}

@Injectable()
export class PantryService {
  private readonly logger = new Logger(PantryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly pointsService: PointsService,
    private readonly metrics: MetricsService,
  ) {}

  async create(userId: string, dto: CreatePantryItemDto): Promise<PantryItem> {
    await this.assertUserCanAccessPantry(userId);

    const item = await this.prisma.pantryItem.create({
      data: {
        userId,
        name: dto.name.trim(),
        quantity: dto.quantity,
        unit: dto.unit.trim(),
        storageLocation: dto.storageLocation ?? "Pantry",
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        ...(dto.pricePaid !== undefined && { pricePaid: dto.pricePaid }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    this.metrics.increment("item_create");

    return item;
  }

  async list(userId: string): Promise<PantryItem[]> {
    await this.assertUserCanAccessPantry(userId);

    const visibleUserIds = await this.resolveHouseholdUserIds(userId);

    return this.prisma.pantryItem.findMany({
      where: { userId: { in: visibleUserIds } },
      orderBy: [{ expirationDate: "asc" }, { createdAt: "desc" }],
    });
  }

  async resolveHouseholdUserIds(userId: string): Promise<string[]> {
    const membership = await this.prisma.householdMember.findFirst({
      where: { userId, status: "ACTIVE" },
      include: {
        household: {
          include: {
            members: { where: { status: "ACTIVE" }, select: { userId: true } },
          },
        },
      },
    });

    if (!membership) {
      return [userId];
    }

    return membership.household.members.map((m) => m.userId);
  }

  async update(userId: string, itemId: string, dto: UpdatePantryItemDto): Promise<PantryItem> {
    await this.assertUserCanAccessPantry(userId);

    const item = await this.prisma.pantryItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== userId) {
      throw new NotFoundException("Pantry item not found");
    }

    return this.prisma.pantryItem.update({
      where: { id: itemId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.quantity !== undefined && { quantity: dto.quantity }),
        ...(dto.unit !== undefined && { unit: dto.unit.trim() }),
        ...(dto.storageLocation !== undefined && { storageLocation: dto.storageLocation }),
        ...(dto.pricePaid !== undefined && { pricePaid: dto.pricePaid }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async registerEvent(
    userId: string,
    itemId: string,
    dto: RegisterConsumptionEventDto,
  ): Promise<{ id: string }> {
    await this.assertUserCanAccessPantry(userId);

    const item = await this.prisma.pantryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException("Pantry item not found");
    }

    const visibleUserIds = await this.resolveHouseholdUserIds(userId);
    if (!visibleUserIds.includes(item.userId)) {
      throw new NotFoundException("Pantry item not found");
    }

    const now = new Date();

    if (dto.type === PantryConsumptionEventType.WASTED && isFarPastExpiry(item, now) && !dto.confirmed) {
      const days = daysPastExpiry(item.expirationDate!, now);
      throw new ConflictException({
        code: "WASTE_CONFIRMATION_REQUIRED",
        itemName: item.name,
        daysPastExpiry: days,
      });
    }

    const quantity = dto.quantity ?? item.quantity;
    const estimatedValueEur = computeEstimatedValue(item.pricePaid, item.quantity, quantity);

    const [event] = await this.prisma.$transaction([
      this.prisma.consumptionEvent.create({
        data: {
          pantryItemId: itemId,
          userId,
          type: dto.type,
          quantity,
          itemName: item.name,
          itemUnit: item.unit,
          ...(item.expirationDate && { itemExpirationDate: item.expirationDate }),
          ...(item.pricePaid !== null && { itemPricePaid: item.pricePaid }),
          ...(item.notes && { itemNotes: item.notes }),
          ...(estimatedValueEur !== null && { estimatedValueEur }),
        },
        select: { id: true },
      }),
      this.prisma.pantryItem.delete({ where: { id: itemId } }),
    ]);

    this.metrics.increment(
      dto.type === PantryConsumptionEventType.WASTED ? "item_waste" : "item_consume",
    );

    // Fire-and-forget gamification processing — a failure here must never fail the consume/waste
    // action (FR-018). Errors are logged and swallowed.
    try {
      await this.pointsService.processConsumptionEvent(event.id);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Gamification processing failed for event ${event.id}: ${reason}`);
    }

    return event;
  }

  /**
   * Re-adds a previously consumed/wasted item back into the pantry, restoring the
   * fields captured on the event. The originating consumption event is deleted in
   * the same transaction so the item cannot be re-added again from history.
   */
  async reAddEvent(userId: string, eventId: string): Promise<PantryItem> {
    await this.assertUserCanAccessPantry(userId);

    const event = await this.prisma.consumptionEvent.findUnique({ where: { id: eventId } });
    if (!event || event.userId !== userId) {
      throw new NotFoundException("Consumption event not found");
    }

    const [item] = await this.prisma.$transaction([
      this.prisma.pantryItem.create({
        data: {
          userId,
          name: event.itemName ?? "Unknown item",
          quantity: event.quantity,
          unit: event.itemUnit ?? "unit",
          ...(event.itemExpirationDate && { expirationDate: event.itemExpirationDate }),
          ...(event.itemPricePaid !== null && { pricePaid: event.itemPricePaid }),
          ...(event.itemNotes && { notes: event.itemNotes }),
        },
      }),
      this.prisma.consumptionEvent.delete({ where: { id: eventId } }),
    ]);

    return item;
  }

  async getUseNext(userId: string): Promise<UseNextResponse> {
    await this.assertUserCanAccessPantry(userId);

    const visibleUserIds = await this.resolveHouseholdUserIds(userId);
    const now = new Date();

    const activeItems = await this.prisma.pantryItem.findMany({
      where: {
        userId: { in: visibleUserIds },
        consumptionEvents: { none: {} },
      },
      select: {
        id: true,
        name: true,
        quantity: true,
        unit: true,
        pricePaid: true,
        expirationDate: true,
        createdAt: true,
      },
    });

    const sorted = activeItems.sort((a, b) =>
      compareUseNextCandidates(a as UseNextCandidate, b as UseNextCandidate, now),
    );

    return {
      items: sorted.map((item) => {
        const days = item.expirationDate ? daysUntilExpiration(item.expirationDate, now) : null;
        return {
          pantryItemId: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          pricePaid: item.pricePaid ? item.pricePaid.toString() : null,
          expirationDate: item.expirationDate ? item.expirationDate.toISOString() : null,
          daysUntilExpiration: days,
          riskLevel: riskFromDays(days),
        };
      }),
    };
  }

  async listEvents(userId: string, type?: "CONSUMED" | "WASTED") {
    await this.assertUserCanAccessPantry(userId);

    return this.prisma.consumptionEvent.findMany({
      where: { userId, ...(type && { type }) },
      orderBy: { occurredAt: "desc" },
      take: 100,
      select: {
        id: true,
        type: true,
        quantity: true,
        itemName: true,
        itemUnit: true,
        itemExpirationDate: true,
        itemPricePaid: true,
        itemNotes: true,
        estimatedValueEur: true,
        occurredAt: true,
      },
    });
  }

  /**
   * Reads the user's auto-expiry staleness threshold in days, defaulting to
   * {@link DEFAULT_AUTO_EXPIRY_THRESHOLD_DAYS} when no preference row exists.
   */
  async getAutoExpiryThresholdDays(userId: string): Promise<number> {
    const preference = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    return preference?.autoExpiryThresholdDays ?? DEFAULT_AUTO_EXPIRY_THRESHOLD_DAYS;
  }

  /**
   * Pure query: the user's own pantry items expired beyond their staleness threshold. Used by both
   * the candidates endpoint (US1) and the auto-expiry cron passes (US2). Does not assert access or
   * apply dismiss suppression — callers add those concerns.
   */
  async getExpiredCandidates(userId: string, now: Date = new Date()): Promise<ExpiredCandidate[]> {
    const thresholdDays = await this.getAutoExpiryThresholdDays(userId);
    const cutoff = new Date(now.getTime() - thresholdDays * DAY_MS);

    const items = await this.prisma.pantryItem.findMany({
      where: { userId, expirationDate: { not: null, lt: cutoff } },
      orderBy: { expirationDate: "asc" },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      expirationDate: item.expirationDate!,
      daysExpired: daysPastExpiry(item.expirationDate!, now),
      estimatedValueEur: computeEstimatedValue(item.pricePaid, item.quantity, item.quantity),
    }));
  }

  /**
   * The expired-candidates view for the pantry banner. Returns an empty list while a recently
   * dismissed (`USER_RESOLVED`) digest is within the 7-day grace window, otherwise the current
   * candidates plus the id of any `PENDING` digest.
   */
  async getExpiredCandidatesForUser(
    userId: string,
    now: Date = new Date(),
  ): Promise<ExpiredCandidatesView> {
    await this.assertUserCanAccessPantry(userId);

    const suppressedSince = new Date(now.getTime() - AUTO_EXPIRY_GRACE_DAYS * DAY_MS);
    const dismissed = await this.prisma.autoExpiryDigest.findFirst({
      where: { userId, status: "USER_RESOLVED", resolvedAt: { gt: suppressedSince } },
    });
    if (dismissed) {
      return { items: [], digestId: null };
    }

    const items = await this.getExpiredCandidates(userId, now);
    const pending = await this.prisma.autoExpiryDigest.findFirst({
      where: { userId, status: "PENDING" },
      orderBy: { sentAt: "desc" },
    });

    return { items, digestId: pending?.id ?? null };
  }

  /**
   * Marks the given items as wasted in a single atomic transaction (all-or-nothing, FR-005) and
   * resolves any pending digest to `USER_RESOLVED`. Throws if any id is not one of the user's own
   * items, leaving the pantry unchanged.
   */
  async bulkWasteItems(
    userId: string,
    itemIds: string[],
    now: Date = new Date(),
  ): Promise<{ wastedCount: number; events: Array<{ id: string; itemId: string }> }> {
    await this.assertUserCanAccessPantry(userId);
    const items = await this.loadOwnedItems(userId, itemIds);

    const eventCreates = items.map((item) =>
      this.prisma.consumptionEvent.create({
        data: buildWasteEventData(userId, item, null),
        select: { id: true },
      }),
    );
    const itemDeletes = items.map((item) =>
      this.prisma.pantryItem.delete({ where: { id: item.id } }),
    );
    const digestResolve = this.prisma.autoExpiryDigest.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "USER_RESOLVED", resolvedAt: now },
    });

    const results = await this.prisma.$transaction([...eventCreates, ...itemDeletes, digestResolve]);

    const events = items.map((item, index) => ({
      id: (results[index] as { id: string }).id,
      itemId: item.id,
    }));

    if (events.length > 0) {
      this.metrics.increment("item_waste", events.length);
    }

    await this.processGamificationForEvents(events.map((event) => event.id));

    return { wastedCount: events.length, events };
  }

  /**
   * Dismisses the given expired candidates without wasting them: the items stay in the pantry and
   * the pending digest is resolved to `USER_RESOLVED` (creating one when none is pending) so the
   * banner is suppressed for the 7-day grace window (R4).
   */
  async bulkDismissExpired(
    userId: string,
    itemIds: string[],
    now: Date = new Date(),
  ): Promise<{ dismissedCount: number }> {
    await this.assertUserCanAccessPantry(userId);
    await this.loadOwnedItems(userId, itemIds);

    const resolved = await this.prisma.autoExpiryDigest.updateMany({
      where: { userId, status: "PENDING" },
      data: { status: "USER_RESOLVED", resolvedAt: now },
    });
    if (resolved.count === 0) {
      await this.prisma.autoExpiryDigest.create({
        data: { userId, status: "USER_RESOLVED", resolvedAt: now },
      });
    }

    return { dismissedCount: itemIds.length };
  }

  /**
   * Re-queries the user's still-stale candidates and wastes them with `method = AUTO_EXPIRED` in a
   * single transaction. Used by the auto-resolve pass (US2) after the 7-day grace. Returns the
   * number of items auto-wasted (0 when nothing remains stale). Does not touch digests — the cron
   * owns digest state.
   */
  async autoWasteExpired(userId: string, now: Date = new Date()): Promise<number> {
    const candidates = await this.getExpiredCandidates(userId, now);
    if (candidates.length === 0) {
      return 0;
    }

    const candidateIds = candidates.map((candidate) => candidate.id);
    const items = await this.prisma.pantryItem.findMany({ where: { id: { in: candidateIds } } });

    const eventCreates = items.map((item) =>
      this.prisma.consumptionEvent.create({
        data: buildWasteEventData(userId, item, AUTO_EXPIRED_METHOD),
        select: { id: true },
      }),
    );
    const itemDeletes = items.map((item) =>
      this.prisma.pantryItem.delete({ where: { id: item.id } }),
    );

    const results = await this.prisma.$transaction([...eventCreates, ...itemDeletes]);
    const eventIds = items.map((_, index) => (results[index] as { id: string }).id);

    this.metrics.increment("item_waste", items.length);

    await this.processGamificationForEvents(eventIds);

    return items.length;
  }

  /**
   * Loads the pantry items for the given ids and verifies every one belongs to the user's
   * household. Throws {@link NotFoundException} listing the failing ids if any is missing or
   * foreign — no item is touched (FR-015).
   */
  private async loadOwnedItems(userId: string, itemIds: string[]): Promise<PantryItem[]> {
    const visibleUserIds = await this.resolveHouseholdUserIds(userId);
    const items = await this.prisma.pantryItem.findMany({ where: { id: { in: itemIds } } });
    const byId = new Map(items.map((item) => [item.id, item]));

    const failedItemIds = itemIds.filter((id) => {
      const item = byId.get(id);
      return !item || !visibleUserIds.includes(item.userId);
    });
    if (failedItemIds.length > 0) {
      throw new NotFoundException({ message: "Pantry items not found", failedItemIds });
    }

    return itemIds.map((id) => byId.get(id)!);
  }

  /**
   * Fire-and-forget gamification processing for newly created waste events. A failure here must
   * never fail the bulk action (FR-018) — errors are logged and swallowed, mirroring
   * {@link registerEvent}.
   */
  private async processGamificationForEvents(eventIds: string[]): Promise<void> {
    for (const eventId of eventIds) {
      try {
        await this.pointsService.processConsumptionEvent(eventId);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Gamification processing failed for event ${eventId}: ${reason}`);
      }
    }
  }

  private async assertUserCanAccessPantry(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to this pantry");
    }
  }
}
