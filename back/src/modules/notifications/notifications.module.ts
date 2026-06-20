import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { NotificationEventsPublisher } from "./notification-events.publisher";
import { NotificationPreferencesService } from "./notification-preferences.service";
import { NotificationThresholdService } from "./notification-threshold.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsScheduler } from "./notifications.scheduler";
import { NotificationsService } from "./notifications.service";

@Module({
	imports: [UsersModule],
	controllers: [NotificationsController],
	providers: [
		NotificationsService,
		NotificationsScheduler,
		NotificationThresholdService,
		NotificationPreferencesService,
		NotificationEventsPublisher,
	],
	exports: [NotificationsService, NotificationPreferencesService],
})
export class NotificationsModule {}
