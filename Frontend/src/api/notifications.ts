import { env } from "../env";

export type PushSubscriptionPayload = {
  endpoint: string;
  p256dhKey: string;
  authKey: string;
};

function getNotificationsBaseUrl(): string {
  // Notification service is exposed under /api at port 8085 in dev
  const base = (env as any).VITE_API_NOTIFICATIONS || "http://localhost:8085/api";
  return `${base}/notifications`;
}

export async function subscribePush(registrationOrPayload: ServiceWorkerRegistration | PushSubscriptionPayload): Promise<Response> {
  if (isPayload(registrationOrPayload)) {
    return fetch(`${getNotificationsBaseUrl()}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(registrationOrPayload),
    });
  }

  const registration = registrationOrPayload;
  const existing = await registration.pushManager.getSubscription();
  const vapidPublicKey = env.VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) throw new Error("Missing VAPID public key");

  const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: new Uint8Array(convertedVapidKey),
    }));

  const { endpoint, keys } = subscription.toJSON() as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  };

  const payload: PushSubscriptionPayload = {
    endpoint,
    p256dhKey: keys.p256dh,
    authKey: keys.auth,
  };

  return fetch(`${getNotificationsBaseUrl()}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
}

export async function unsubscribePush(registrationOrEndpoint: ServiceWorkerRegistration | string): Promise<Response> {
  if (typeof registrationOrEndpoint === "string") {
    return fetch(`${getNotificationsBaseUrl()}/unsubscribe?endpoint=${encodeURIComponent(registrationOrEndpoint)}`, {
      method: "DELETE",
      credentials: "include",
    });
  }
  const registration = registrationOrEndpoint;
  const existing = await registration.pushManager.getSubscription();
  if (!existing) {
    return new Response(JSON.stringify({ message: "No subscription" }), { status: 200 });
  }
  const { endpoint } = existing.toJSON() as { endpoint: string };
  const resp = await fetch(`${getNotificationsBaseUrl()}/unsubscribe?endpoint=${encodeURIComponent(endpoint)}`, {
    method: "DELETE",
    credentials: "include",
  });
  try {
    await existing.unsubscribe();
  } catch (_) {}
  return resp;
}

export async function listSubscriptions(): Promise<Response> {
  return fetch(`${getNotificationsBaseUrl()}/subscriptions`, {
    method: "GET",
    credentials: "include",
  });
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isPayload(x: any): x is PushSubscriptionPayload {
  return x && typeof x === "object" && typeof x.endpoint === "string" && typeof x.p256dhKey === "string" && typeof x.authKey === "string";
}

// duplicate legacy exports removed


