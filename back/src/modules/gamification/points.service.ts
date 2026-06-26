import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { BadgeService } from "./badge.service";
import { computePointRows } from "./scoring";

/**
 * Computes and persists the point deltas for a consumption/waste event, then triggers badge
 * evaluation. Called fire-and-forget from the pantry flow — callers must not depend on it for the
 * consume action to succeed.
 */
@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgeService,
  ) {}

  async processConsumptionEvent(eventId: string): Promise<void> {
    const event = await this.prisma.consumptionEvent.findUnique({ where: { id: eventId } });
    if (!event) {
      return;
    }

    const rows = computePointRows(event);
    for (const row of rows) {
      await this.prisma.userPoints.create({
        data: {
          userId: event.userId,
          delta: row.delta,
          reason: row.reason,
          referenceId: event.id,
        },
      });
    }

    // Badge evaluation must not break point persistence — log and swallow failures.
    try {
      await this.badgeService.evaluateBadges(event.userId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Badge evaluation failed for user ${event.userId}: ${reason}`);
    }
  }
}
