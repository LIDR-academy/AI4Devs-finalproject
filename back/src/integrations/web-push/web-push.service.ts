import * as webPush from "web-push";
import { Injectable } from "@nestjs/common";
import type {
  WebPushPort,
  PushSubscriptionData,
  PushPayload,
} from "../../modules/notifications/ports/notification-ports";

@Injectable()
export class WebPushService implements WebPushPort {
  constructor() {
    webPush.setVapidDetails(
      process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
      process.env.VAPID_PUBLIC_KEY ?? "",
      process.env.VAPID_PRIVATE_KEY ?? "",
    );
  }

  async sendNotification(subscription: PushSubscriptionData, payload: PushPayload): Promise<void> {
    await webPush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    );
  }
}
