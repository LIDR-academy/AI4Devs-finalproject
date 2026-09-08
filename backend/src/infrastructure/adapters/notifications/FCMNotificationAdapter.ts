import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import type {
  DeliveryOutcome,
  NotificationSender,
  OutgoingPush,
} from "../../../domain/ports/NotificationSender.js";

const PERMANENT_ERRORS = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

function resolveServiceAccountConfig(): Parameters<typeof cert>[0] | null {
  const keyEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (keyEnv) {
    try {
      return JSON.parse(keyEnv);
    } catch {
      console.error("[FCM] FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON; disabling push.");
      return null;
    }
  }

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  return path ?? null;
}

export function createFCMAdapter(): NotificationSender | null {
  const serviceAccountConfig = resolveServiceAccountConfig();
  if (!serviceAccountConfig) return null;

  const apps = getApps();
  if (apps.length === 0) {
    initializeApp({ credential: cert(serviceAccountConfig) });
  }

  return {
    async send(push: OutgoingPush, tokens: string[]): Promise<DeliveryOutcome> {
      const messaging = getMessaging();

      const message = {
        notification: {
          title: "Coacher",
          body: push.content,
        },
        data: push.data ?? {},
        tokens,
      };

      const response = await messaging.sendEachForMulticast(message);

      const succeeded: string[] = [];
      const failed: { token: string; reason: string; permanent: boolean }[] = [];

      for (let i = 0; i < tokens.length; i++) {
        const resp = response.responses[i];
        if (resp.success) {
          succeeded.push(tokens[i]);
        } else {
          const code = resp.error?.code ?? "unknown";
          failed.push({
            token: tokens[i],
            reason: code,
            permanent: PERMANENT_ERRORS.has(code),
          });
        }
      }

      return { succeeded, failed };
    },
  };
}
