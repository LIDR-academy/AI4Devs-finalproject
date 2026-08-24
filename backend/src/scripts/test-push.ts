/**
 * Test script: sends a push notification to all registered devices.
 *
 * Usage:
 *   node --loader ts-node/esm backend/src/scripts/test-push.ts
 *   — or —
 *   npx tsx backend/src/scripts/test-push.ts
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH in backend/.env
 */

import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, "../..");

const prisma = new PrismaClient();

async function main() {
  const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!saPath) {
    console.error("FIREBASE_SERVICE_ACCOUNT_PATH is not set in backend/.env");
    process.exit(1);
  }

  const resolvedPath = path.isAbsolute(saPath) ? saPath : path.resolve(BACKEND_ROOT, saPath);

  const apps = getApps();
  if (apps.length === 0) {
    initializeApp({ credential: cert(resolvedPath) });
  }

  const tokens = await prisma.deviceToken.findMany({
    where: { is_active: true },
    select: { token: true, user_id: true, platform: true },
  });

  if (tokens.length === 0) {
    console.error(
      "No active device tokens found. Register a device first (sign in and accept push notifications).",
    );
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log(`Found ${tokens.length} active device token(s). Sending test push...\n`);

  const messaging = getMessaging();

  for (const { token, user_id, platform } of tokens) {
    try {
      const result = await messaging.sendEachForMulticast({
        notification: {
          title: "Coacher",
          body: "This is a test push notification 🎉",
        },
        data: {
          notificationId: `test-${Date.now()}`,
          type: "1",
          link: "/",
        },
        tokens: [token],
      });

      for (const resp of result.responses) {
        if (resp.success) {
          console.log(`✅ Sent to device (user: ${user_id}, platform: ${platform})`);
        } else {
          console.error(`❌ Failed for user ${user_id}: ${resp.error?.code ?? "unknown"}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error sending to user ${user_id}:`, (err as Error).message);
    }
  }

  await prisma.$disconnect();
  console.log("\nDone.");
}

main();
