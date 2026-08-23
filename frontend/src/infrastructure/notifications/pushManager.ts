import { registerDeviceToken } from "../repositories/notificationsRepository";
import { getMessagingClient, isFirebaseConfigured } from "./firebaseClient";

const COOLDOWN_DAYS = 30;
const NAVIGATION_KEY = "pushNavCount";
const DECLINED_KEY = "pushDeclinedAt";

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function isInCooldown(): boolean {
  try {
    const ts = localStorage.getItem(DECLINED_KEY);
    if (!ts) return false;
    const elapsed = Date.now() - Number(ts);
    return elapsed < COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function hasNavigated(): boolean {
  try {
    const count = Number(localStorage.getItem(NAVIGATION_KEY) ?? "0");
    return count > 0;
  } catch {
    return false;
  }
}

function stampNavigation() {
  try {
    const count = Number(localStorage.getItem(NAVIGATION_KEY) ?? "0");
    localStorage.setItem(NAVIGATION_KEY, String(count + 1));
  } catch {
    // noop
  }
}

export type PushAffordance = {
  visible: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

export function dismissPushPrompt(): void {
  try {
    localStorage.setItem(DECLINED_KEY, String(Date.now()));
  } catch {
    // noop
  }
}

export function resetNavigationGuard(): void {
  try {
    localStorage.setItem(NAVIGATION_KEY, "0");
  } catch {
    // noop
  }
}

export async function runPushRegistration(): Promise<PushAffordance> {
  console.log("[pushManager] Starting registration flow");

  if (!isSupported()) {
    console.log("[pushManager] Skipped: browser not supported");
    return { visible: false, onAccept: () => {}, onDismiss: () => {} };
  }

  if (Notification.permission === "denied") {
    console.log("[pushManager] Skipped: permission denied");
    return { visible: false, onAccept: () => {}, onDismiss: () => {} };
  }

  if (!isFirebaseConfigured()) {
    console.log("[pushManager] Skipped: Firebase not configured");
    return { visible: false, onAccept: () => {}, onDismiss: () => {} };
  }

  if (isInCooldown()) {
    console.log("[pushManager] Skipped: in cooldown");
    return { visible: false, onAccept: () => {}, onDismiss: () => {} };
  }

  stampNavigation();

  if (!hasNavigated()) {
    console.log("[pushManager] Skipped: first navigation (count:", localStorage.getItem(NAVIGATION_KEY), ")");
    return { visible: false, onAccept: () => {}, onDismiss: () => {} };
  }

  // Already granted — auto-register silently
  if (Notification.permission === "granted") {
    console.log("[pushManager] Permission already granted — auto-registering");
    await silentRegister();
    return { visible: false, onAccept: () => {}, onDismiss: () => {} };
  }

  // permission === "default" — show affordance
  console.log("[pushManager] Showing affordance (permission: default)");
  return {
    visible: true,
    onAccept: async () => {
      try {
        const result = await Notification.requestPermission();
        if (result === "granted") {
          await silentRegister();
        } else {
          dismissPushPrompt();
        }
      } catch {
        dismissPushPrompt();
      }
    },
    onDismiss: () => {
      dismissPushPrompt();
    },
  };
}

async function ensureServiceWorker(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistrations();
  if (existing.length > 0 && existing[0].active) {
    console.log("[pushManager] ✅ Using existing SW registration");
    return existing[0];
  }

  console.log("[pushManager] No active SW — registering push.js manually");
  const reg = await navigator.serviceWorker.register("/push.js", { scope: "/" });
  console.log("[pushManager] ✅ push.js SW registered, waiting for activation...");
  await new Promise<void>((resolve) => {
    if (reg.installing || reg.waiting) {
      const sw = reg.installing ?? reg.waiting;
      sw?.addEventListener("statechange", () => {
        if (sw.state === "activated") resolve();
      });
    } else if (reg.active) {
      resolve();
    }
  });
  console.log("[pushManager] ✅ SW activated");
  return reg;
}

async function silentRegister(): Promise<void> {
  try {
    console.log("[pushManager] Starting silent registration");
    const client = await getMessagingClient();
    if (!client) {
      console.warn("[pushManager] ❌ Firebase messaging client unavailable — aborting");
      return;
    }
    console.log("[pushManager] ✅ Firebase messaging client ready");

    const { getToken } = await import("firebase/messaging");
    const sw = await ensureServiceWorker();
    console.log("[pushManager] ✅ Service worker ready, calling getToken...");

    const token = await getToken(client.messaging as never, {
      vapidKey: client.vapidKey,
      serviceWorkerRegistration: sw,
    });

    console.log("[pushManager] ✅ getToken returned:", token ? `${token.substring(0, 30)}...` : "null/empty");

    if (token) {
      console.log("[pushManager] Registering token with backend...");
      await registerDeviceToken({ token, platform: "WEB" });
      console.log("[pushManager] ✅ Device token registered with backend successfully!");
    } else {
      console.warn("[pushManager] ❌ getToken returned null — no token obtained");
    }
  } catch (err) {
    console.error("[pushManager] ❌ Silent registration FAILED:", err);
  }
}
