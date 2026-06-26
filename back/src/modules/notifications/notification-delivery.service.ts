import { Injectable, Inject, Logger } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import {
  SES_PORT,
  WEB_PUSH_PORT,
  type SesPort,
  type WebPushPort,
  type ExpiryItem,
  type PushSubscriptionData,
} from "./ports/notification-ports";

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SES_PORT) private readonly sesService: SesPort,
    @Inject(WEB_PUSH_PORT) private readonly webPushService: WebPushPort,
  ) {}

  async deliverExpiry(userId: string, items: ExpiryItem[], userEmail: string): Promise<void> {
    const pref = await this.prisma.notificationPreference.findUnique({ where: { userId } });
    if (pref && !pref.expirationEnabled) {
      return;
    }

    await this.#deliverEmail(userId, userEmail, items);

    const sub = await this.prisma.pushSubscription.findUnique({ where: { userId } });
    if (sub) {
      await this.#deliverPush(userId, sub);
    }
  }

  /**
   * Sends a web-push notification announcing a newly earned badge. No-op when the user has no
   * push subscription. Never throws — a delivery failure is logged and must not block badge
   * persistence (FR-019).
   */
  async deliverBadge(userId: string, badgeLabel: string, badgeDescription: string): Promise<void> {
    const sub = await this.prisma.pushSubscription.findUnique({ where: { userId } });
    if (!sub) {
      return;
    }

    try {
      await this.webPushService.sendNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title: "You earned a badge!", body: `${badgeLabel} — ${badgeDescription}` },
      );
      await this.prisma.notificationLog.create({
        data: { userId, type: "BADGE_EARNED", channel: "WEB_PUSH", status: "SENT" },
      });
    } catch (error) {
      const failReason = error instanceof Error ? error.message : String(error);
      const is410 = (error as { statusCode?: number }).statusCode === 410;
      if (is410) {
        await this.prisma.pushSubscription.deleteMany({ where: { userId } });
      }
      await this.prisma.notificationLog.create({
        data: { userId, type: "BADGE_EARNED", channel: "WEB_PUSH", status: "FAILED", failReason },
      });
    }
  }

  async savePushSubscription(userId: string, data: PushSubscriptionData): Promise<string> {
    const record = await this.prisma.pushSubscription.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data },
    });
    return record.id;
  }

  async deletePushSubscription(userId: string): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { userId } });
  }

  async #deliverEmail(userId: string, userEmail: string, items: ExpiryItem[]): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await this.prisma.notificationLog.findFirst({
      where: { userId, type: "EXPIRY", channel: "EMAIL", status: "SENT", sentAt: { gte: cutoff } },
    });
    if (existing) return;

    try {
      await this.sesService.sendEmail({
        to: userEmail,
        subject: "Items expiring soon — RealSaveFooding",
        htmlBody: this.#renderExpiryHtml(items),
      });
      await this.prisma.notificationLog.create({
        data: { userId, type: "EXPIRY", channel: "EMAIL", status: "SENT" },
      });
    } catch (error) {
      const failReason = error instanceof Error ? error.message : String(error);
      this.logger.error(`email_delivery_failed userId=${userId}`, failReason);
      await this.prisma.notificationLog.create({
        data: { userId, type: "EXPIRY", channel: "EMAIL", status: "FAILED", failReason },
      });
    }
  }

  async #deliverPush(
    userId: string,
    sub: { endpoint: string; p256dh: string; auth: string },
  ): Promise<void> {
    try {
      await this.webPushService.sendNotification(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        { title: "Items expiring soon", body: "Some items in your pantry are about to expire." },
      );
      await this.prisma.notificationLog.create({
        data: { userId, type: "EXPIRY", channel: "WEB_PUSH", status: "SENT" },
      });
    } catch (error) {
      const failReason = error instanceof Error ? error.message : String(error);
      const is410 = (error as { statusCode?: number }).statusCode === 410;
      if (is410) {
        await this.prisma.pushSubscription.deleteMany({ where: { userId } });
      }
      await this.prisma.notificationLog.create({
        data: { userId, type: "EXPIRY", channel: "WEB_PUSH", status: "FAILED", failReason },
      });
    }
  }

  #renderExpiryHtml(items: ExpiryItem[]): string {
    const rows = items
      .map((i) => `<li>${i.name} — expires ${i.expirationDate.toLocaleDateString("en-GB")}</li>`)
      .join("");
    return `<h2>Items expiring soon</h2><ul>${rows}</ul>`;
  }
}
