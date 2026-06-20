import { Injectable, Logger } from "@nestjs/common";

export interface ExpirationNotificationEvent {
  type: "EXPIRING_SOON";
  userId: string;
  pantryItemId: string;
  itemName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  emittedAt: string;
}

@Injectable()
export class NotificationEventsPublisher {
  private readonly logger = new Logger(NotificationEventsPublisher.name);
  private readonly events: ExpirationNotificationEvent[] = [];

  async publishExpirationEvent(event: ExpirationNotificationEvent): Promise<void> {
    this.events.push(event);
    this.logger.log(
      `notification_event type=${event.type} user=${event.userId} pantryItem=${event.pantryItemId}`,
    );
  }

  listUserEvents(userId: string): ExpirationNotificationEvent[] {
    return this.events
      .filter((event) => event.userId === userId)
      .sort((a, b) => b.emittedAt.localeCompare(a.emittedAt));
  }

  clearUserEvents(userId: string): void {
    const kept = this.events.filter((event) => event.userId !== userId);
    this.events.length = 0;
    this.events.push(...kept);
  }
}
