import type { Notification } from "../../domain/entities/Notification.js";
import type { NotificationRepository } from "../../domain/ports/NotificationRepository.js";
import { NotFoundError } from "../../infrastructure/errors.js";

export class MarkNotificationAsRead {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(id: string, recipientId: string): Promise<Notification> {
    const notification = await this.repository.findById(id);
    if (!notification) {
      throw new NotFoundError("Notification not found");
    }
    if (notification.recipientId !== recipientId) {
      throw new NotFoundError("Notification not found");
    }
    return this.repository.markAsRead(id);
  }
}
