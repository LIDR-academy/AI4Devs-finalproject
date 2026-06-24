import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function subscribeToPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }

  if (!VAPID_PUBLIC_KEY) {
    throw new Error("VITE_VAPID_PUBLIC_KEY is not set in front/.env — add it and restart the dev server.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return false;
  }

  await navigator.serviceWorker.register("/sw.js");
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
  });

  const json = subscription.toJSON();
  const token = getAccessToken();

  await fetch(`${API_BASE_URL}/notifications/push-subscription`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    }),
  });

  return true;
}

export async function unsubscribeFromPush(): Promise<void> {
  const token = getAccessToken();
  await fetch(`${API_BASE_URL}/notifications/push-subscription`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
