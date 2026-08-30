import type {
  ListNotificationsParams,
  ListNotificationsResponse,
  Notification,
} from "@/domain/types/notification";
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/infrastructure/repositories/notificationsRepository";

export async function fetchNotifications(
  params: ListNotificationsParams,
): Promise<ListNotificationsResponse> {
  return listNotifications(params);
}

export async function markAsRead(id: string): Promise<Notification> {
  return markNotificationAsRead(id);
}

export async function markAllAsRead(): Promise<{ count: number }> {
  return markAllNotificationsAsRead();
}
