import { expect, test } from "@playwright/test";
import {
  callNotificationsEndpoint,
  createPantryItem,
  registerUser,
  seedSession,
} from "./_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

test.describe("Notification Preferences", () => {
  test("disable suppresses events and re-enable resumes delivery", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.tkt005.pref.${ts}@notifications-e2e.example.com`,
    );

    await createPantryItem(request, auth.accessToken, "Yogurt 3 days", 3);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/settings`);
    const toggle = page.getByTestId("notification-expiration-toggle");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.getByTestId("notification-preference-message")).toContainText(
      "Notification preferences saved.",
    );

    const priceDropToggle = page.getByTestId("notification-price-drop-toggle");
    const consumedToggle = page.getByTestId("notification-food-consumed-toggle");

    await expect(priceDropToggle).toHaveAttribute("aria-pressed", "true");
    await expect(consumedToggle).toHaveAttribute("aria-pressed", "true");

    await priceDropToggle.click();
    await expect(priceDropToggle).toHaveAttribute("aria-pressed", "false");

    await consumedToggle.click();
    await expect(consumedToggle).toHaveAttribute("aria-pressed", "false");

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

    await page.goto(`${FRONT_BASE_URL}/notifications`);
    await expect(page.getByTestId("notification-events-empty")).toBeVisible();

    await page.goto(`${FRONT_BASE_URL}/settings`);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");

    await priceDropToggle.click();
    await expect(priceDropToggle).toHaveAttribute("aria-pressed", "true");

    await consumedToggle.click();
    await expect(consumedToggle).toHaveAttribute("aria-pressed", "true");

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

    await page.goto(`${FRONT_BASE_URL}/notifications`);
    await expect(page.getByTestId("notification-events-list")).toBeVisible();
    await expect(page.getByTestId("notification-event-item")).toHaveCount(1);
  });
});
