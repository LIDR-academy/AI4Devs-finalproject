import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

interface ApiErrorBody {
  message?: string | string[];
}

export interface NotificationPreferences {
  expirationEnabled: boolean;
  priceDropEnabled: boolean;
  foodConsumedByOthersEnabled: boolean;
}

export interface NotificationEvent {
  type: "EXPIRING_SOON";
  userId: string;
  pantryItemId: string;
  itemName: string;
  expirationDate: string;
  daysUntilExpiration: number;
  emittedAt: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(errorBody.message)
      ? errorBody.message.join(", ")
      : (errorBody.message ?? "Request failed");
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function getNotificationPreferences(): Promise<NotificationPreferences> {
  return requestJson<NotificationPreferences>("/settings/notifications", {
    method: "GET",
  });
}

export function updateNotificationPreferences(
  payload: NotificationPreferences,
): Promise<NotificationPreferences> {
  return requestJson<NotificationPreferences>("/settings/notifications", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function evaluateExpiringNotifications(): Promise<{
  generated: number;
  suppressedByPreference: number;
  suppressedByDuplicate: number;
}> {
  return requestJson<{
    generated: number;
    suppressedByPreference: number;
    suppressedByDuplicate: number;
  }>("/notifications/evaluate-expiring", {
    method: "POST",
  });
}

export function listNotificationEvents(): Promise<{ events: NotificationEvent[] }> {
  return requestJson<{ events: NotificationEvent[] }>("/notifications/events", {
    method: "GET",
  });
}

export function clearNotificationEvents(): Promise<{ ok: boolean }> {
  return requestJson<{ ok: boolean }>("/notifications/events/clear", {
    method: "POST",
  });
}

export function registerPushSubscription(payload: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}): Promise<{ id: string }> {
  return requestJson<{ id: string }>("/notifications/push-subscription", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deletePushSubscription(): Promise<void> {
  return requestJson<void>("/notifications/push-subscription", { method: "DELETE" });
}
