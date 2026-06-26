import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { BadgeService } from "./badge.service";
import { DAY_MS } from "./scoring";
import { getWeekStart } from "./week";

const TICK_INTERVAL_MS = 60 * 60 * 1000; // hourly
const WEEK_MS = 7 * DAY_MS;

/**
 * Evaluates the ZERO_WASTE_WEEK badge for completed Mon–Sun weeks. Uses the same setInterval
 * scheduling pattern as `NotificationsScheduler` (no extra scheduling dependency). A per-week
 * guard makes the exact tick time non-critical; badge idempotency prevents duplicates.
 */
@Injectable()
export class GamificationCronService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GamificationCronService.name);
  private intervalRef: NodeJS.Timeout | null = null;
  private lastProcessedWeekStart: number | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
  ) {}

  onModuleInit(): void {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    this.intervalRef = setInterval(() => {
      void this.runIfNewWeekCompleted();
    }, TICK_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private async runIfNewWeekCompleted(): Promise<void> {
    const now = new Date();
    const completedWeekStart = getWeekStart(now).getTime() - WEEK_MS;
    if (this.lastProcessedWeekStart === completedWeekStart) {
      return;
    }
    try {
      await this.evaluateZeroWasteWeek(now);
      this.lastProcessedWeekStart = completedWeekStart;
    } catch (error) {
      this.logger.error(
        "gamification_cron_error",
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Awards ZERO_WASTE_WEEK to every user who had at least one event and zero wasted items during
   * the most recently completed Mon–Sun week relative to `now`.
   */
  async evaluateZeroWasteWeek(now: Date): Promise<void> {
    const weekEnd = getWeekStart(now); // start of current week = end of last completed week
    const weekStart = new Date(weekEnd.getTime() - WEEK_MS);

    const events = await this.prisma.consumptionEvent.findMany({
      where: { occurredAt: { gte: weekStart, lt: weekEnd } },
      select: { userId: true, type: true },
    });

    const wasteByUser = new Map<string, boolean>();
    for (const event of events) {
      const hadWaste = wasteByUser.get(event.userId) ?? false;
      wasteByUser.set(event.userId, hadWaste || event.type === "WASTED");
    }

    for (const [userId, hadWaste] of wasteByUser) {
      if (!hadWaste) {
        await this.badgeService.awardBadge(userId, "ZERO_WASTE_WEEK");
      }
    }
  }
}
