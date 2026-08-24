import type { Notification } from "../../domain/entities/Notification.js";
import type {
  CursorPaginatedResult,
  ListNotificationsFilters,
  NotificationRepository,
} from "../../domain/ports/NotificationRepository.js";

export class ListNotifications {
  constructor(private readonly repository: NotificationRepository) {}

  async execute(filters: ListNotificationsFilters): Promise<CursorPaginatedResult<Notification>> {
    return this.repository.listByRecipient(filters);
  }
}
