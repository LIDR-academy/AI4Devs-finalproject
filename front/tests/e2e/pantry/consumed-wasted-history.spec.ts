import { expect, test } from "@playwright/test";
import { createAndGetPantryItem, registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

test.describe("Pantry — Consumed history filter", () => {
  test("Consumed filter shows consumed items and hides active items", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.consumed.${ts}@pantry-e2e.example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Apple Juice", 7);
    const activeItem = await createAndGetPantryItem(request, auth.accessToken, "Still Active", 7);

    // Consume only the first item
    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    // Default view shows active item, not consumed one
    await expect(page.getByText("Still Active")).toBeVisible();

    // Switch to Consumed filter
    await page.getByRole("button", { name: "Consumed" }).click();

    await expect(page.getByTestId("pantry-events-list")).toBeVisible();
    await expect(page.getByText("Apple Juice")).toBeVisible();
    await expect(page.getByText("Still Active")).not.toBeVisible();

    void activeItem; // referenced to avoid lint warning
  });

  test("Wasted filter shows wasted items", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.wasted.${ts}@pantry-e2e.example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Stale Bread", 0);

    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "WASTED" },
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    await page.getByRole("button", { name: "Wasted" }).click();

    await expect(page.getByTestId("pantry-events-list")).toBeVisible();
    await expect(page.getByText("Stale Bread")).toBeVisible();
  });

  test("Re-add button adds the item back to pantry", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.readd.${ts}@pantry-e2e.example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Re-add Milk", 3);

    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    // Go to consumed view
    await page.getByRole("button", { name: "Consumed" }).click();
    await expect(page.getByText("Re-add Milk")).toBeVisible();

    // Click Re-add
    const reAddBtn = page.getByTestId(/event-readd-/).first();
    await reAddBtn.click();

    // Success message appears
    await expect(page.getByTestId("re-add-success")).toBeVisible();
    await expect(page.getByTestId("re-add-success")).toContainText("Re-add Milk");

    // Event disappears from the consumed list immediately (no hard refresh)
    await expect(page.getByText("Re-add Milk")).not.toBeVisible();

    // Switching to All filter shows the re-added item without a page reload
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText("Re-add Milk")).toBeVisible();

    // Confirm via API
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{ name: string }>;
    expect(items.find((i) => i.name === "Re-add Milk")).toBeDefined();
  });

  test("Re-added item does not stay in the consumed list and cannot be re-added twice", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.readd-once.${ts}@pantry-e2e.example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Once Only Milk", 3);

    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByRole("button", { name: "Consumed" }).click();
    await expect(page.getByText("Once Only Milk")).toBeVisible();

    await page.getByTestId(/event-readd-/).first().click();
    await expect(page.getByTestId("re-add-success")).toBeVisible();

    // Reload the page entirely — the event must not come back from the API
    await page.reload();
    await page.getByRole("button", { name: "Consumed" }).click();
    await expect(page.getByText("Once Only Milk")).not.toBeVisible();

    // Only ONE pantry item should exist — no duplicates were created
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{ name: string }>;
    expect(items.filter((i) => i.name === "Once Only Milk")).toHaveLength(1);

    // And the consumption event is gone from history
    const eventsRes = await request.get(`${API_BASE_URL}/pantry/items/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = (await eventsRes.json()) as Array<{ itemName: string | null }>;
    expect(events.filter((e) => e.itemName === "Once Only Milk")).toHaveLength(0);
  });

  test("Consumed filter shows empty state when no events exist", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.empty.${ts}@pantry-e2e.example.com`);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    await page.getByRole("button", { name: "Consumed" }).click();

    await expect(page.getByText("No consumed items found.")).toBeVisible();
  });

  test("Re-add restores expirationDate and pricePaid of the original item", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.readd-fields.${ts}@pantry-e2e.example.com`,
    );

    // Create item with a known expiration date and price via API
    const expiry = new Date();
    expiry.setUTCDate(expiry.getUTCDate() + 10);
    expiry.setUTCHours(12, 0, 0, 0);
    const expirationDate = expiry.toISOString();

    const createRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { name: "Premium Yogurt", quantity: 2, unit: "unit", pricePaid: 3.49, expirationDate },
    });
    expect(createRes.ok()).toBeTruthy();
    const item = (await createRes.json()) as { id: string };

    // Consume it
    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });

    // Re-add via UI
    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByRole("button", { name: "Consumed" }).click();
    await expect(page.getByText("Premium Yogurt")).toBeVisible();

    await page.getByTestId(/event-readd-/).first().click();
    await expect(page.getByTestId("re-add-success")).toBeVisible();

    // Confirm via API that the new item has the original expiration and price
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{
      name: string;
      pricePaid: string | null;
      expirationDate: string | null;
    }>;
    const restored = items.find((i) => i.name === "Premium Yogurt");
    expect(restored).toBeDefined();
    expect(restored!.pricePaid).toBe("3.49");
    expect(restored!.expirationDate).not.toBeNull();
    expect(new Date(restored!.expirationDate!).toDateString()).toBe(expiry.toDateString());
  });

  test("Re-added item preserves emoji set on the original item", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.emoji.${ts}@pantry-e2e.example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Emoji Cheese", 5);

    await seedSession(page, auth);
    // Navigate to the item detail page and pick a non-default emoji.
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);
    await page.getByTestId("item-emoji-btn").click();
    await page.getByTestId("item-emoji-pick-🧀").click();

    // Consume the item via API
    await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });

    // Go to Consumed list and re-add
    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByRole("button", { name: "Consumed" }).click();
    await expect(page.getByText("Emoji Cheese")).toBeVisible();

    const reAddBtn = page.getByTestId(/event-readd-/).first();
    await reAddBtn.click();
    await expect(page.getByTestId("re-add-success")).toBeVisible();

    // Switch to All and verify the emoji is preserved
    await page.getByRole("button", { name: "All" }).click();
    await expect(page.getByText("Emoji Cheese")).toBeVisible();
    // The row for the re-added item should display the 🧀 emoji
    const itemRow = page.locator(".ios-card").filter({ hasText: "Emoji Cheese" }).first();
    await expect(itemRow).toContainText("🧀");
  });
});
