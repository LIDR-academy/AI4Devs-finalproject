import type { NotificationRepository } from "../../domain/ports/NotificationRepository.js";

export class MarkAllNotificationsAsRead {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(recipientId: string): Promise<{ count: number }> {
    const count = await this.repository.markAllAsRead(recipientId);
    return { count };
  }
}