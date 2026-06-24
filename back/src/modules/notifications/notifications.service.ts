import { Injectable, Logger } from "@nestjs/common";
import type { PantryItem } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { NotificationDeliveryService } from "./notification-delivery.service";
import { NotificationEventsPublisher } from "./notification-events.publisher";
import { NotificationPreferencesService } from "./notification-preferences.service";
import {
  EXPIRING_SOON_THRESHOLD_DAYS,
  NotificationThresholdService,
} from "./notification-threshold.service";

export interface EvaluationMetrics {
  scanned: number;
  generated: number;
  suppressedByPreference: number;
  suppressedByDuplicate: number;
  errors: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly thresholdService: NotificationThresholdService,
    private readonly preferencesService: NotificationPreferencesService,
    private readonly eventsPublisher: NotificationEventsPublisher,
    private readonly deliveryService: NotificationDeliveryService,
  ) {}

  async evaluateExpiringItems(now = new Date()): Promise<EvaluationMetrics> {
    const metrics: EvaluationMetrics = {
      scanned: 0,
      generated: 0,
      suppressedByPreference: 0,
      suppressedByDuplicate: 0,
      errors: 0,
    };

    const candidates = await this.prisma.pantryItem.findMany({
      where: {
        expirationDate: {
          not: null,
        },
      },
      orderBy: [{ expirationDate: "asc" }, { createdAt: "desc" }],
    });

    metrics.scanned = candidates.length;

    for (const candidate of candidates) {
      try {
        await this.processCandidate(candidate, now, metrics);
      } catch (error) {
        metrics.errors += 1;
        this.logger.error(
          `notification_eval_error pantryItem=${candidate.id}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    this.logger.log(
      `notification_metrics scanned=${metrics.scanned} generated=${metrics.generated} suppressed_preference=${metrics.suppressedByPreference} suppressed_duplicate=${metrics.suppressedByDuplicate} errors=${metrics.errors}`,
    );

    return metrics;
  }

  private async processCandidate(
    pantryItem: PantryItem,
    now: Date,
    metrics: EvaluationMetrics,
  ): Promise<void> {
    if (!pantryItem.expirationDate) {
      return;
    }

    const daysUntilExpiration = this.thresholdService.daysUntilExpiration(
      pantryItem.expirationDate,
      now,
    );

    if (!this.thresholdService.shouldNotify(daysUntilExpiration)) {
      return;
    }

    const isEnabled = await this.preferencesService.isExpirationEnabled(pantryItem.userId);
    if (!isEnabled) {
      metrics.suppressedByPreference += 1;
      return;
    }

    const alreadyAlerted = this.wasAlertedOnDate(
      pantryItem.lastExpirationAlertAt,
      now,
    );
    if (alreadyAlerted) {
      metrics.suppressedByDuplicate += 1;
      return;
    }

    await this.eventsPublisher.publishExpirationEvent({
      type: "EXPIRING_SOON",
      userId: pantryItem.userId,
      pantryItemId: pantryItem.id,
      itemName: pantryItem.name,
      expirationDate: pantryItem.expirationDate.toISOString(),
      daysUntilExpiration,
      emittedAt: now.toISOString(),
    });

    const user = await this.prisma.user.findUnique({ where: { id: pantryItem.userId } });
    if (user) {
      this.deliveryService
        .deliverExpiry(
          pantryItem.userId,
          [{ name: pantryItem.name, expirationDate: pantryItem.expirationDate }],
          user.email,
        )
        .catch((err: unknown) => {
          this.logger.error(
            `delivery_error pantryItem=${pantryItem.id}`,
            err instanceof Error ? err.stack : undefined,
          );
        });
    }

    await this.prisma.pantryItem.update({
      where: { id: pantryItem.id },
      data: {
        lastExpirationAlertAt: now,
      },
    });

    metrics.generated += 1;
  }

  private wasAlertedOnDate(lastAlertAt: Date | null, now: Date): boolean {
    if (!lastAlertAt) {
      return false;
    }

    const a = new Date(lastAlertAt);
    const b = new Date(now);

    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  getThresholdDays(): number {
    return EXPIRING_SOON_THRESHOLD_DAYS;
  }

  async resetUserAlertMarks(userId: string): Promise<void> {
    await this.prisma.pantryItem.updateMany({
      where: {
        userId,
      },
      data: {
        lastExpirationAlertAt: null,
      },
    });
  }
}
