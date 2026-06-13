import { Body, Controller, Get, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateNotificationPreferenceDto } from "./dto/update-notification-preference.dto";
import { NotificationEventsPublisher } from "./notification-events.publisher";
import { NotificationPreferencesService } from "./notification-preferences.service";
import { NotificationsService } from "./notifications.service";

interface RequestWithUser {
  user: {
    id: string;
    email: string;
  };
}

@Controller()
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly preferencesService: NotificationPreferencesService,
    private readonly notificationsService: NotificationsService,
    private readonly eventsPublisher: NotificationEventsPublisher,
  ) {}

  @Get("settings/notifications")
  getPreferences(@Request() req: RequestWithUser) {
    return this.preferencesService.getPreferences(req.user.id);
  }

  @Patch("settings/notifications")
  updatePreferences(
    @Request() req: RequestWithUser,
    @Body() body: UpdateNotificationPreferenceDto,
  ) {
    return this.preferencesService.updatePreferences(
      req.user.id,
      {
        expirationEnabled: body.expirationEnabled,
        priceDropEnabled: body.priceDropEnabled,
        foodConsumedByOthersEnabled: body.foodConsumedByOthersEnabled,
      },
    );
  }

  @Post("notifications/evaluate-expiring")
  evaluateNow() {
    return this.notificationsService.evaluateExpiringItems();
  }

  @Get("notifications/events")
  listEvents(@Request() req: RequestWithUser) {
    return {
      events: this.eventsPublisher.listUserEvents(req.user.id),
    };
  }

  @Post("notifications/events/clear")
  async clearEvents(@Request() req: RequestWithUser) {
    this.eventsPublisher.clearUserEvents(req.user.id);
    await this.notificationsService.resetUserAlertMarks(req.user.id);
    return {
      ok: true,
    };
  }
}
