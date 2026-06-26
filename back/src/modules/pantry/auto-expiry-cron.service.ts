import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { NotificationDeliveryService } from "../notifications/notification-delivery.service";
import { UsersService } from "../users/users.service";
import { AUTO_EXPIRY_GRACE_DAYS, PantryService } from "./pantry.service";

const TICK_INTERVAL_MS = 60 * 60 * 1000; // hourly
const DAY_MS = 24 * 60 * 60 * 1000;
const GRACE_MS = AUTO_EXPIRY_GRACE_DAYS * DAY_MS;
const DIGEST_DEDUP_MS = 7 * DAY_MS;

/**
 * Drives the two auto-expiry background passes using the same `setInterval` pattern as
 * `NotificationsScheduler` / `GamificationCronService` (no extra scheduling dependency). Each pass
 * is idempotent and time-guarded, so the exact tick cadence is non-critical, and each per-user /
 * per-digest unit is isolated so one failure never aborts the batch (FR-017).
 */
@Injectable()
export class AutoExpiryCronService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutoExpiryCronService.name);
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pantryService: PantryService,
    private readonly deliveryService: NotificationDeliveryService,
    private readonly usersService: UsersService,
  ) {}

  onModuleInit(): void {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    this.intervalRef = setInterval(() => {
      void this.runPasses();
    }, TICK_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private async runPasses(): Promise<void> {
    const now = new Date();
    try {
      await this.runDailyDigestPass(now);
    } catch (error) {
      this.logger.error("auto_expiry_daily_pass_error", error instanceof Error ? error.stack : undefined);
    }
    try {
      await this.runAutoResolvePass(now);
    } catch (error) {
      this.logger.error("auto_expiry_resolve_pass_error", error instanceof Error ? error.stack : undefined);
    }
  }

  /**
   * For each user with stale candidates and auto-expiry enabled, records a PENDING digest and
   * requests a digest notification — unless a digest was already created within the last 7 days.
   */
  async runDailyDigestPass(now: Date = new Date()): Promise<void> {
    const userIds = await this.findUsersWithExpiredItems(now);

    for (const userId of userIds) {
      try {
        if (!(await this.isAutoExpiryEnabled(userId))) {
          continue;
        }

        const candidates = await this.pantryService.getExpiredCandidates(userId, now);
        if (candidates.length === 0) {
          continue;
        }

        const recentDigest = await this.prisma.autoExpiryDigest.findFirst({
          where: { userId, sentAt: { gt: new Date(now.getTime() - DIGEST_DEDUP_MS) } },
        });
        if (recentDigest) {
          continue;
        }

        await this.prisma.autoExpiryDigest.create({ data: { userId, status: "PENDING", sentAt: now } });

        const user = await this.usersService.findById(userId);
        if (user) {
          await this.deliveryService.deliverDigest(
            userId,
            candidates.map((candidate) => ({ name: candidate.name, daysExpired: candidate.daysExpired })),
            user.email,
          );
        }
      } catch (error) {
        this.logger.error(
          `auto_expiry_daily_pass_user_error userId=${userId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  /**
   * For each PENDING digest older than the 7-day grace, auto-wastes the still-stale candidates
   * (tagged AUTO_EXPIRED) and marks the digest AUTO_RESOLVED. Sends a summary notification when
   * items were wasted and the user's email is available.
   */
  async runAutoResolvePass(now: Date = new Date()): Promise<void> {
    const dueDigests = await this.prisma.autoExpiryDigest.findMany({
      where: { status: "PENDING", sentAt: { lt: new Date(now.getTime() - GRACE_MS) } },
    });

    for (const digest of dueDigests) {
      try {
        const wastedCount = await this.pantryService.autoWasteExpired(digest.userId, now);

        await this.prisma.autoExpiryDigest.update({
          where: { id: digest.id },
          data: { status: "AUTO_RESOLVED", resolvedAt: now },
        });

        if (wastedCount > 0) {
          const user = await this.usersService.findById(digest.userId);
          if (user) {
            await this.deliveryService.deliverDigestSummary(digest.userId, wastedCount, user.email);
          }
        }
      } catch (error) {
        this.logger.error(
          `auto_expiry_resolve_pass_digest_error digestId=${digest.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  /** Distinct user ids that currently own at least one past-its-expiry pantry item. */
  private async findUsersWithExpiredItems(now: Date): Promise<string[]> {
    const rows = await this.prisma.pantryItem.findMany({
      where: { expirationDate: { not: null, lt: now } },
      select: { userId: true },
      distinct: ["userId"],
    });
    return rows.map((row) => row.userId);
  }

  /** Auto-expiry defaults to enabled when the user has no preference row. */
  private async isAutoExpiryEnabled(userId: string): Promise<boolean> {
    const preference = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    return preference?.autoExpiryEnabled ?? true;
  }
}
