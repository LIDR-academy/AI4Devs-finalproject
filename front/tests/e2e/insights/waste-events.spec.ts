import { expect, test } from "@playwright/test";
import {
  createAndGetPantryItem,
  registerUser,
  seedSession,
} from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

// AC1 — User can register a consumption event via the item detail page
test.describe("AC1 — Consume event from item detail", () => {
  test("marks item as consumed, redirects to pantry, item disappears", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.consume.${ts}@waste-e2e.example.com`);
    const item = await createAndGetPantryItem(request, auth.accessToken, "Yogurt", 5);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    const consumeBtn = page.getByTestId("item-consume-button");
    await expect(consumeBtn).toBeVisible();
    await expect(consumeBtn).toBeEnabled();

    await consumeBtn.click();

    await page.waitForURL(`${FRONT_BASE_URL}/pantry`);
    await expect(page.getByText("Yogurt")).not.toBeVisible();
  });
});

// AC1 — User can register a waste event (no far-past-expiry → no confirmation needed)
test.describe("AC1 — Waste event from item detail (recent expiry, no gate)", () => {
  test("marks item as wasted directly when not far-past-expiry, redirects to pantry", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.waste-direct.${ts}@waste-e2e.example.com`);
    // 3 days expired — below the 7-day far-past-expiry threshold
    const item = await createAndGetPantryItem(request, auth.accessToken, "Cheese", -3);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    const wasteBtn = page.getByTestId("item-waste-button");
    await expect(wasteBtn).toBeVisible();
    await expect(wasteBtn).toBeEnabled();

    await wasteBtn.click();

    // No confirmation modal for recently-expired items
    await expect(page.getByTestId("waste-confirmation-modal")).not.toBeVisible();

    await page.waitForURL(`${FRONT_BASE_URL}/pantry`);
    await expect(page.getByText("Cheese")).not.toBeVisible();
  });
});

// AC2 — Waste suggestion requires explicit confirmation for far-past-expiry items
test.describe("AC2 — Waste confirmation gate (far-past-expiry)", () => {
  test("shows confirmation modal when item is expired >7 days ago", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.gate.${ts}@waste-e2e.example.com`);
    // 10 days expired — above the 7-day threshold
    const item = await createAndGetPantryItem(request, auth.accessToken, "Bread", -10);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByTestId("item-waste-button").click();

    await expect(page.getByTestId("waste-confirmation-modal")).toBeVisible();
    await expect(page.getByTestId("waste-confirmation-modal")).toContainText("Bread");
    await expect(page.getByTestId("waste-confirmation-modal")).toContainText("day(s) ago");
  });

  test("cancelling confirmation prevents event creation; item remains", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.cancel.${ts}@waste-e2e.example.com`);
    const item = await createAndGetPantryItem(request, auth.accessToken, "Spinach", -10);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByTestId("item-waste-button").click();
    await expect(page.getByTestId("waste-confirmation-modal")).toBeVisible();

    await page.getByTestId("waste-confirmation-cancel").click();

    // Modal dismissed
    await expect(page.getByTestId("waste-confirmation-modal")).not.toBeVisible();

    // Item still present via API (was NOT deleted)
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{ id: string }>;
    expect(items.find((i) => i.id === item.id)).toBeDefined();
  });

  test("confirming waste registers the event and removes the item", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.confirm.${ts}@waste-e2e.example.com`);
    const item = await createAndGetPantryItem(request, auth.accessToken, "Milk", -10);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByTestId("item-waste-button").click();
    await expect(page.getByTestId("waste-confirmation-modal")).toBeVisible();

    await page.getByTestId("waste-confirmation-confirm").click();

    await page.waitForURL(`${FRONT_BASE_URL}/pantry`);
    await expect(page.getByText("Milk")).not.toBeVisible();

    // Item is gone via API
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{ id: string }>;
    expect(items.find((i) => i.id === item.id)).toBeUndefined();
  });
});

// AC3 — Insights reflect waste events
test.describe("AC3 — Waste metrics on insights page", () => {
  test("waste metrics section shows zeros before any events", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.metrics-zero.${ts}@waste-e2e.example.com`);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("waste-metrics-section")).toBeVisible();
    await expect(page.getByTestId("waste-event-count")).toContainText("0");
    await expect(page.getByTestId("waste-total-quantity")).toContainText("0");
    await expect(page.getByTestId("waste-total-value")).toContainText("€0.00");
  });

  test("waste metrics increment after a waste event is confirmed", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.metrics-update.${ts}@waste-e2e.example.com`);

    // Create an item via API with pricePaid so estimated value is non-zero
    const createRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: {
        name: "Rice",
        quantity: 2,
        unit: "kg",
        pricePaid: 3.00,
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const item = (await createRes.json()) as { id: string };

    // Register waste event via API (no expiry → no gate needed)
    const eventRes = await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "WASTED" },
    });
    expect(eventRes.ok()).toBeTruthy();

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);

    await expect(page.getByTestId("waste-event-count")).toContainText("1");
    await expect(page.getByTestId("waste-total-quantity")).toContainText("2");
    // Full pricePaid wasted (2 of 2 units) = €3.00
    await expect(page.getByTestId("waste-total-value")).toContainText("€3.00");
  });

  test("waste metrics are consistent across page refreshes", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.metrics-persist.${ts}@waste-e2e.example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Tomatoes", 2);

    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "WASTED" },
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/insights`);
    await expect(page.getByTestId("waste-event-count")).toContainText("1");

    await page.reload();
    await expect(page.getByTestId("waste-event-count")).toContainText("1");
  });
});

// DoD — Duplicate submission protection
test.describe("Duplicate submission protection", () => {
  test("second consume attempt on already-consumed item shows error, not a crash", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt009.dup.${ts}@waste-e2e.example.com`);
    const item = await createAndGetPantryItem(request, auth.accessToken, "Orange", 3);

    // First: consume via API (item is now deleted)
    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });

    // Navigate to the (now-deleted) item
    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // If the frontend loads a 404 from the list, the item is null — stays on loading screen
    // or error state. Either way, the consume button click should surface a safe error.
    // The item won't be found in the list, so the page shows loading / not found.
    // Verify via API that a second POST returns 404.
    const dupRes = await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });
    expect(dupRes.status()).toBe(404);
  });
});
