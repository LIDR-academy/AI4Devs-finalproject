import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { NotificationDeliveryService } from "../notifications/notification-delivery.service";
import { getBadgeDefinition, type BadgeCode } from "./badge-catalog";
import { isConsumedBeforeExpiry } from "./scoring";

/** Milestone thresholds for the "items consumed before expiry" badges. */
const SAVER_THRESHOLDS: Array<{ count: number; code: BadgeCode }> = [
  { count: 10, code: "SAVER_10" },
  { count: 50, code: "SAVER_50" },
  { count: 100, code: "SAVER_100" },
];

const MONEY_SAVER_THRESHOLD_EUR = 10;

@Injectable()
export class BadgeService {
  private readonly logger = new Logger(BadgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationDelivery: NotificationDeliveryService,
  ) {}

  /**
   * Evaluates the milestone/value badges (FIRST_SAVE, SAVER_*, MONEY_SAVER_10) for a user and
   * awards any newly qualified ones. ZERO_WASTE_WEEK is handled by the weekly cron.
   */
  async evaluateBadges(userId: string): Promise<void> {
    const [beforeExpiryCount, consumedEvents] = await Promise.all([
      this.prisma.userPoints.count({ where: { userId, reason: "CONSUMED_BEFORE_EXPIRY" } }),
      this.prisma.consumptionEvent.findMany({
        where: { userId, type: "CONSUMED" },
        select: { itemExpirationDate: true, occurredAt: true, estimatedValueEur: true },
      }),
    ]);

    const valueSaved = consumedEvents
      .filter((e) => isConsumedBeforeExpiry(e.occurredAt, e.itemExpirationDate))
      .reduce((acc, e) => acc + (e.estimatedValueEur ? Number(e.estimatedValueEur) : 0), 0);

    const qualified: BadgeCode[] = [];
    if (beforeExpiryCount >= 1) qualified.push("FIRST_SAVE");
    for (const { count, code } of SAVER_THRESHOLDS) {
      if (beforeExpiryCount >= count) qualified.push(code);
    }
    if (valueSaved >= MONEY_SAVER_THRESHOLD_EUR) qualified.push("MONEY_SAVER_10");

    for (const code of qualified) {
      await this.awardBadge(userId, code);
    }
  }

  /**
   * Awards a single badge if the user does not already hold it. Idempotent: a unique-constraint
   * conflict (already earned, e.g. on a concurrent retry) is treated as a no-op and does not fire
   * a duplicate notification.
   */
  async awardBadge(userId: string, code: BadgeCode): Promise<void> {
    const existing = await this.prisma.userBadge.findMany({ where: { userId }, select: { code: true } });
    if (existing.some((b) => b.code === code)) {
      return;
    }

    try {
      await this.prisma.userBadge.create({ data: { userId, code } });
    } catch (error) {
      // P2002 = unique constraint violation → the badge was awarded concurrently; treat as no-op.
      if ((error as { code?: string }).code === "P2002") {
        return;
      }
      throw error;
    }

    const def = getBadgeDefinition(code);
    if (def) {
      try {
        await this.notificationDelivery.deliverBadge(userId, def.label, def.description);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Badge notification failed for ${userId}/${code}: ${reason}`);
      }
    }
  }
}
