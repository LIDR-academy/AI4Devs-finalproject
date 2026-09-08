import type {
  ListNotificationsParams,
  ListNotificationsResponse,
  Notification,
  RegisterDeviceTokenPayload,
  RegisterDeviceTokenResponse,
} from "@/domain/types/notification";
import apiClient from "@/infrastructure/repositories/apiClient";

export async function registerDeviceToken(
  payload: RegisterDeviceTokenPayload,
): Promise<RegisterDeviceTokenResponse> {
  const { data } = await apiClient.post<RegisterDeviceTokenResponse>(
    "/notifications/device-token",
    { token: payload.token, platform: payload.platform ?? "WEB" },
  );
  return data;
}

export async function listNotifications(
  params: ListNotificationsParams,
): Promise<ListNotificationsResponse> {
  const { data } = await apiClient.get<ListNotificationsResponse>("/notifications", { params });
  return data;
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsAsRead(): Promise<{ count: number }> {
  const { data } = await apiClient.patch<{ count: number }>("/notifications/read-all");
  return data;
}
