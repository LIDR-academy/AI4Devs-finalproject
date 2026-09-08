import type { Notification } from "../../domain/entities/Notification.js";
import type { NotificationRepository } from "../../domain/ports/NotificationRepository.js";

export class GetNotificationById {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(id: string, recipientId: string): Promise<Notification | null> {
    const notification = await this.repository.findById(id);
    if (!notification || notification.recipientId !== recipientId) {
      return null;
    }
    return notification;
  }
}
