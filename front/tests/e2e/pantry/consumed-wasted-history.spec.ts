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

  test("Consumed filter shows empty state when no events exist", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.history.empty.${ts}@pantry-e2e.example.com`);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    await page.getByRole("button", { name: "Consumed" }).click();

    await expect(page.getByText("No consumed items found.")).toBeVisible();
  });
});
