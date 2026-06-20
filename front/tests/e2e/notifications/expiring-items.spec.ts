import { expect, test } from "@playwright/test";
import {
  callNotificationsEndpoint,
  createPantryItem,
  registerUser,
  seedSession,
} from "./_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

test.describe("Expiring Items Behavior", () => {
  test("item expiring in 3 days produces visible notification event", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.tkt005.exp.${ts}@notifications-e2e.example.com`,
    );

    await createPantryItem(request, auth.accessToken, "Trigger Item +3", 3);
    await callNotificationsEndpoint(
      request,
      auth.accessToken,
      "POST",
      "notifications/events/clear",
    );
    await callNotificationsEndpoint(
      request,
      auth.accessToken,
      "POST",
      "notifications/evaluate-expiring",
    );

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/notifications`);

    await expect(page.getByTestId("notification-events-list")).toBeVisible();
    await expect(page.getByText("Trigger Item +3")).toBeVisible();
    await expect(page.getByText("Expires in 3 days", { exact: false })).toBeVisible();
  });
});
