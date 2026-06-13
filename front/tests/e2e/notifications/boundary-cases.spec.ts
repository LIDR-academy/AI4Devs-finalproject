import { expect, test } from "@playwright/test";
import {
  callNotificationsEndpoint,
  createPantryItem,
  registerUser,
  seedSession,
} from "./_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

test.describe("Boundary Conditions", () => {
  test("4 days none, 3 days trigger, 2 days none; duplicate prevented on rerun", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.tkt005.boundary.${ts}@notifications-e2e.example.com`,
    );

    await createPantryItem(request, auth.accessToken, "Boundary +4", 4);
    await createPantryItem(request, auth.accessToken, "Boundary +3", 3);
    await createPantryItem(request, auth.accessToken, "Boundary +2", 2);
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

    await expect(page.getByTestId("notification-event-item")).toHaveCount(1);
    await expect(page.getByText("Boundary +3")).toBeVisible();
    await expect(page.getByText("Boundary +4")).toHaveCount(0);
    await expect(page.getByText("Boundary +2")).toHaveCount(0);

    await callNotificationsEndpoint(
      request,
      auth.accessToken,
      "POST",
      "notifications/evaluate-expiring",
    );
    await page.reload();
    await expect(page.getByTestId("notification-event-item")).toHaveCount(1);
  });
});
