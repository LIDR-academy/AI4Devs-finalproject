let initialized = false;
let messagingInstance: unknown = null;
let vapidKey = "";
let foregroundListenerRegistered = false;

function getFirebaseConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;
  const vapid = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, vapid };
}

export function isFirebaseConfigured(): boolean {
  const c = getFirebaseConfig();
  const configured = Boolean(c.apiKey && c.projectId && c.vapid);
  console.log("[firebaseClient] isFirebaseConfigured:", configured, {
    apiKey: c.apiKey ? "set" : "missing",
    projectId: c.projectId ? "set" : "missing",
    vapid: c.vapid ? "set" : "missing",
  });
  return configured;
}

export async function getMessagingClient(): Promise<{
  messaging: unknown;
  vapidKey: string;
} | null> {
  if (!isFirebaseConfigured()) {
    console.warn("[firebaseClient] Not configured, returning null");
    return null;
  }

  if (initialized && messagingInstance) {
    console.log("[firebaseClient] Already initialized, returning cached instance");
    return { messaging: messagingInstance, vapidKey };
  }

  try {
    const config = getFirebaseConfig();
    vapidKey = config.vapid;
    console.log("[firebaseClient] Initializing Firebase app...");

    const { initializeApp, getApps } = await import("firebase/app");
    const existing = getApps().length > 0 ? getApps()[0] : undefined;
    const app =
      existing ??
      initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
      });

    console.log("[firebaseClient] Firebase app initialized, getting messaging...");
    const { getMessaging } = await import("firebase/messaging");
    messagingInstance = getMessaging(app);
    initialized = true;
    console.log("[firebaseClient] Messaging instance ready");

    registerForegroundListener(messagingInstance);

    return { messaging: messagingInstance, vapidKey };
  } catch (err) {
    console.error("[firebaseClient] Initialization FAILED:", err);
    return null;
  }
}

function registerForegroundListener(messaging: unknown): void {
  if (foregroundListenerRegistered) return;
  foregroundListenerRegistered = true;

  import("firebase/messaging")
    .then(({ onMessage }) => {
      onMessage(messaging as Parameters<typeof onMessage>[0], (payload) => {
        console.log("[firebaseClient] Foreground message (log-only):", payload.notification);
      });
    })
    .catch(() => {
      // noop — listener registration is best-effort
    });
}
