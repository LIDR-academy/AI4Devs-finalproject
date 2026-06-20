import { expect, test } from "@playwright/test";
import { createAndGetPantryItem, registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

/**
 * Use-next prioritization — TKT-010
 *
 * Scoring: daysUntilExpiration ascending (expired items first, no-expiry items last).
 * Tie-breaks: exact expiration timestamp → createdAt (older first) → id lexicographic.
 *
 * The use-next list is shown on the Insights (dashboard) page only.
 */

test.describe("Use-next prioritization", () => {
  // ── Scenario 1: Dashboard use-next ordering ──────────────────────────────────
  test("Scenario 1 — dashboard shows use-next list in expiration priority order", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.usenext.order.${ts}@e2e.example.com`);

    await createAndGetPantryItem(request, auth.accessToken, "Rice", 7);
    await createAndGetPantryItem(request, auth.accessToken, "Milk", 1);
    await createAndGetPantryItem(request, auth.accessToken, "Yogurt", 3);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-use-next-list")).toBeVisible();

    // Milk (1 day) → Yogurt (3 days) → Rice (7 days)
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Milk");
    await expect(page.getByTestId("dashboard-use-next-item-1")).toContainText("Yogurt");
    await expect(page.getByTestId("dashboard-use-next-item-2")).toContainText("Rice");
  });

  // ── Scenario 2: Risk badges reflect correct levels ───────────────────────────
  test("Scenario 2 — items display the correct risk level badge", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.usenext.risk.${ts}@e2e.example.com`);

    const milk = await createAndGetPantryItem(request, auth.accessToken, "Milk", 1);
    const yogurt = await createAndGetPantryItem(request, auth.accessToken, "Yogurt", 3);
    const rice = await createAndGetPantryItem(request, auth.accessToken, "Rice", 7);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-use-next-list")).toBeVisible();

    // Each item's risk badge
    await expect(page.getByTestId(`dashboard-use-next-name-${milk.id}`).locator("..")).toContainText("HIGH");
    await expect(page.getByTestId(`dashboard-use-next-name-${yogurt.id}`).locator("..")).toContainText("MEDIUM");
    await expect(page.getByTestId(`dashboard-use-next-name-${rice.id}`).locator("..")).toContainText("LOW");
  });

  // ── Scenario 3: Ordering verified via API endpoint ───────────────────────────
  test("Scenario 3 — /pantry/use-next endpoint returns items in correct priority order", async ({
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.usenext.api.${ts}@e2e.example.com`);

    await createAndGetPantryItem(request, auth.accessToken, "Pasta", 10);
    await createAndGetPantryItem(request, auth.accessToken, "Chicken", 0);
    await createAndGetPantryItem(request, auth.accessToken, "Spinach", 2);

    const res = await request.get(`${API_BASE_URL}/pantry/use-next`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(res.ok()).toBeTruthy();

    const { items } = (await res.json()) as { items: Array<{ name: string; riskLevel: string }> };

    expect(items[0].name).toBe("Chicken");
    expect(items[0].riskLevel).toBe("HIGH");
    expect(items[1].name).toBe("Spinach");
    expect(items[1].riskLevel).toBe("MEDIUM");
    expect(items[2].name).toBe("Pasta");
    expect(items[2].riskLevel).toBe("LOW");
  });

  // ── Scenario 4: Tie-break validation ─────────────────────────────────────────
  test("Scenario 4 — items with same expiration days are tie-broken by creation order", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.usenext.tiebreak.${ts}@e2e.example.com`);

    // Both expire in 5 days. The one created first (Cheese) should rank before the second (Butter).
    const cheese = await createAndGetPantryItem(request, auth.accessToken, "Cheese", 5);
    const butter = await createAndGetPantryItem(request, auth.accessToken, "Butter", 5);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-use-next-list")).toBeVisible();

    // Cheese was created first → must appear before Butter
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Cheese");
    await expect(page.getByTestId("dashboard-use-next-item-1")).toContainText("Butter");

    // Also verify via the API endpoint
    const res = await request.get(`${API_BASE_URL}/pantry/use-next`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const { items } = (await res.json()) as { items: Array<{ name: string }> };
    expect(items[0].name).toBe("Cheese");
    expect(items[1].name).toBe("Butter");

    void cheese;
    void butter;
  });

  // ── Scenario 5: Empty state ───────────────────────────────────────────────────
  test("Scenario 5 — empty state is shown on dashboard when no pantry items exist", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.usenext.empty.${ts}@e2e.example.com`);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-use-next-empty")).toBeVisible();
    await expect(page.getByTestId("dashboard-use-next-empty")).toContainText(
      "No active items to prioritize.",
    );
  });

  // ── Scenario 6: Refresh behavior ─────────────────────────────────────────────
  test("Scenario 6 — use-next list refreshes after an item is consumed", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.usenext.refresh.${ts}@e2e.example.com`);

    const milk = await createAndGetPantryItem(request, auth.accessToken, "Milk", 1);
    await createAndGetPantryItem(request, auth.accessToken, "Rice", 10);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("dashboard-use-next-list")).toBeVisible();
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Milk");

    // Consume Milk via the use-next consume button
    await page.getByTestId(`dashboard-use-next-consume-${milk.id}`).click();

    // Milk should disappear and Rice should now be first
    await expect(page.getByTestId("dashboard-use-next-item-0")).toContainText("Rice");
    await expect(page.getByTestId("dashboard-use-next-list")).not.toContainText("Milk");

    // Verify via API that the item was actually consumed
    const eventsRes = await request.get(`${API_BASE_URL}/pantry/items/events?type=CONSUMED`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = (await eventsRes.json()) as Array<{ itemName: string }>;
    expect(events.find((e) => e.itemName === "Milk")).toBeDefined();
  });
});
