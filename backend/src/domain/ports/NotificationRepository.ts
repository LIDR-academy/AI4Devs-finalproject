import type { Notification } from "../entities/Notification.js";

export interface CreateNotificationInput {
  recipientId: string;
  type: number;
  content: string;
  classId?: string;
}

export interface ListNotificationsFilters {
  recipientId: string;
  todayOnly?: boolean;
  unreadOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export interface CursorPaginatedResult<T> {
  data: T[];
  meta: {
    hasMore: boolean;
    nextCursor: string | null;
    totalCount: number;
    unreadCount: number;
  };
}

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<{ id: string }>;
  findById(id: string): Promise<Notification | null>;
  listByRecipient(filters: ListNotificationsFilters): Promise<CursorPaginatedResult<Notification>>;
  countUnreadByRecipient(recipientId: string): Promise<number>;
  markAsRead(id: string): Promise<Notification>;
}
