import { Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { SesService } from "../../integrations/aws-ses/ses.service";
import { WebPushService } from "../../integrations/web-push/web-push.service";
import { NotificationDeliveryService } from "./notification-delivery.service";
import { NotificationEventsPublisher } from "./notification-events.publisher";
import { NotificationPreferencesService } from "./notification-preferences.service";
import { NotificationThresholdService } from "./notification-threshold.service";
import { NotificationsController } from "./notifications.controller";
import { NotificationsScheduler } from "./notifications.scheduler";
import { NotificationsService } from "./notifications.service";
import { SES_PORT, WEB_PUSH_PORT } from "./ports/notification-ports";

@Module({
	imports: [UsersModule],
	controllers: [NotificationsController],
	providers: [
		NotificationsService,
		NotificationsScheduler,
		NotificationThresholdService,
		NotificationPreferencesService,
		NotificationEventsPublisher,
		NotificationDeliveryService,
		{ provide: SES_PORT, useClass: SesService },
		{ provide: WEB_PUSH_PORT, useClass: WebPushService },
	],
	exports: [NotificationsService, NotificationPreferencesService],
})
export class NotificationsModule {}
