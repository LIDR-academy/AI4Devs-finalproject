import { Module } from "@nestjs/common";
import { NotificationsModule } from "../notifications/notifications.module";
import { BadgeService } from "./badge.service";
import { GamificationController } from "./gamification.controller";
import { GamificationCronService } from "./gamification-cron.service";
import { GamificationService } from "./gamification.service";
import { PointsService } from "./points.service";

/**
 * Gamification module — points and badges layer.
 *
 * `PointsService` is exported so the pantry flow can trigger point processing after a
 * consumption event is created. `PrismaService` is globally provided; `NotificationsModule`
 * supplies `NotificationDeliveryService` for badge push notifications.
 */
@Module({
  imports: [NotificationsModule],
  controllers: [GamificationController],
  providers: [GamificationService, PointsService, BadgeService, GamificationCronService],
  exports: [PointsService],
})
export class GamificationModule {}
