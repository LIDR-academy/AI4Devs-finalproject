import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

const EVALUATION_INTERVAL_MS = 60_000;

@Injectable()
export class NotificationsScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsScheduler.name);
  private intervalRef: NodeJS.Timeout | null = null;

  constructor(private readonly notificationsService: NotificationsService) {}

  onModuleInit(): void {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    // Minimal MVP scheduler using setInterval keeps dependency footprint low.
    this.intervalRef = setInterval(() => {
      void this.runEvaluation();
    }, EVALUATION_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private async runEvaluation(): Promise<void> {
    try {
      await this.notificationsService.evaluateExpiringItems();
    } catch (error) {
      this.logger.error(
        "notification_scheduler_error",
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
