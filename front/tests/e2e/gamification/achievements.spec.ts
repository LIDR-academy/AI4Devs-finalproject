import { expect, test, type Page } from "@playwright/test";
import { registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

const MOCK_SUMMARY = {
  totalPoints: 35,
  totalValueSavedEur: 12.5,
  totalValueWastedEur: 3,
  consumedBeforeExpiryCount: 3,
  wastedCount: 1,
  badges: [
    {
      id: "b1",
      code: "FIRST_SAVE",
      earnedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      label: "First Save",
      description: "You consumed your first item before it expired.",
    },
  ],
  weeklyStreak: 2,
};

const MOCK_HISTORY_PAGE_1 = {
  events: Array.from({ length: 20 }, (_, i) => ({
    id: `p${i}`,
    type: "POINTS_EARNED",
    points: 10,
    badgeCode: null,
    reason: "Consumed before expiry",
    occurredAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
  })),
  total: 25,
};

async function mockGamification(page: Page) {
  await page.route("**/gamification/summary**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_SUMMARY),
    });
  });
  await page.route("**/gamification/history**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(MOCK_HISTORY_PAGE_1),
    });
  });
}

test.describe("Achievements page", () => {
  test("shows total points, earned and locked badges, and history", async ({ page, request }) => {
    const email = `gamification-e2e-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockGamification(page);

    await page.goto(`${FRONT_BASE_URL}/achievements`);

    await expect(page.getByTestId("achievements-total-points")).toHaveText("35", { timeout: 8000 });

    // Earned badge in full state, locked badge greyed with its condition.
    await expect(page.getByTestId("achievement-badge-FIRST_SAVE")).toHaveAttribute(
      "data-earned",
      "true",
    );
    const locked = page.getByTestId("achievement-badge-SAVER_50");
    await expect(locked).toHaveAttribute("data-earned", "false");
    await expect(locked).toContainText(/consume 50 items before expiry/i);

    // History list renders entries.
    await expect(page.getByTestId("history-list")).toContainText("Consumed before expiry");
  });
});
