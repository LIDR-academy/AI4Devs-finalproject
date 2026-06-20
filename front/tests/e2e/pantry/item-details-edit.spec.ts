import { expect, test } from "@playwright/test";
import {
  createAndGetPantryItem,
  registerUser,
  seedSession,
} from "../notifications/_helpers";
import {
  acceptInvitation,
  createHousehold,
  sendInvitation,
} from "../sharing/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";
const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

test.describe("Item details edit — quantity, unit, price", () => {
  test("saves edits and reflects them in UI and backend after page reload", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-edit.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(
      request,
      auth.accessToken,
      "Test Milk",
      7,
    );

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // --- Edit quantity ---
    const quantityInput = page.getByTestId("item-quantity-input");
    await quantityInput.fill("3");

    // --- Edit unit ---
    const unitSelect = page.getByTestId("item-unit-select");
    await unitSelect.selectOption("kg");

    // --- Edit price ---
    const priceInput = page.getByTestId("item-price-input");
    await priceInput.fill("4.99");

    // --- Save ---
    await page.getByTestId("item-details-save").click();
    await expect(page.getByTestId("item-details-message")).toContainText("Details saved.");

    // --- UI reflects the update immediately ---
    await expect(quantityInput).toHaveValue("3");
    await expect(unitSelect).toHaveValue("kg");
    await expect(priceInput).toHaveValue("4.99");

    // Paid stat tile updated
    await expect(page.getByText("€4.99")).toBeVisible();

    // --- Reload and confirm persistence in UI ---
    await page.reload();
    await expect(page.getByTestId("item-quantity-input")).toHaveValue("3");
    await expect(page.getByTestId("item-unit-select")).toHaveValue("kg");
    await expect(page.getByTestId("item-price-input")).toHaveValue("4.99");
    await expect(page.getByText("€4.99")).toBeVisible();

    // --- Confirm via direct API round-trip ---
    const listResponse = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listResponse.ok()).toBeTruthy();
    const items = (await listResponse.json()) as Array<{
      id: string;
      quantity: number;
      unit: string;
      pricePaid: string | null;
    }>;
    const saved = items.find((i) => i.id === item.id);
    expect(saved).toBeDefined();
    expect(saved!.quantity).toBe(3);
    expect(saved!.unit).toBe("kg");
    expect(saved!.pricePaid).toBe("4.99");
  });

  test("item name can be edited and is persisted to UI and backend", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-name-edit.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(request, auth.accessToken, "Old Name", 5);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // Name input is pre-populated with the current name
    const nameInput = page.getByTestId("item-name-input");
    await expect(nameInput).toHaveValue("Old Name");

    // Change the name and save
    await nameInput.fill("New Name");
    await page.getByTestId("item-details-save").click();
    await expect(page.getByTestId("item-details-message")).toContainText("Details saved.");

    // Header heading reflects the new name immediately
    await expect(page.getByRole("heading", { name: "New Name" })).toBeVisible();

    // Reload and confirm persistence in the UI
    await page.reload();
    await expect(page.getByTestId("item-name-input")).toHaveValue("New Name");

    // Confirm via API
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{ id: string; name: string }>;
    expect(items.find((i) => i.id === item.id)?.name).toBe("New Name");
  });

  test("shows validation error when the name is cleared", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-name-empty.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(request, auth.accessToken, "Keep Me", 2);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByTestId("item-name-input").fill("   ");
    await page.getByTestId("item-details-save").click();

    await expect(page.getByTestId("item-details-error")).toContainText("Name is required.");
  });

  test("Mark as consumed removes item from pantry and redirects", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-consume.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(request, auth.accessToken, "Yogurt", 2);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // Button is enabled
    const consumeBtn = page.getByTestId("item-consume-button");
    await expect(consumeBtn).toBeVisible();
    await expect(consumeBtn).toBeEnabled();

    // Click it
    await consumeBtn.click();

    // Should redirect to pantry
    await page.waitForURL(`${FRONT_BASE_URL}/pantry`);

    // Item no longer appears in the pantry list
    await expect(page.getByText("Yogurt")).not.toBeVisible();

    // Confirm via API: item is gone (deleted on consume)
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    expect(listRes.ok()).toBeTruthy();
    const items = (await listRes.json()) as Array<{ id: string }>;
    expect(items.find((i) => i.id === item.id)).toBeUndefined();
  });

  test("household member can mark a shared item as consumed", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const userA = await registerUser(request, `pw.consume-hh-a.${ts}@pantry-e2e.example.com`);
    const userB = await registerUser(request, `pw.consume-hh-b.${ts}@pantry-e2e.example.com`);

    // User A creates a household and an item
    const hh = await createHousehold(request, userA.accessToken, "Consume HH");
    const item = await createAndGetPantryItem(request, userA.accessToken, "Shared Cheese", 3);

    // User B joins the household
    const inv = await sendInvitation(request, userA.accessToken, hh.id, userB.user.email);
    await acceptInvitation(request, userB.accessToken, inv.id);

    // User B navigates to User A's item
    await seedSession(page, userB);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    const consumeBtn = page.getByTestId("item-consume-button");
    await expect(consumeBtn).toBeVisible();
    await expect(consumeBtn).toBeEnabled();

    await consumeBtn.click();

    // Redirects to pantry — shared item gone from B's view
    await page.waitForURL(`${FRONT_BASE_URL}/pantry`);
    await expect(page.getByText("Shared Cheese")).not.toBeVisible();
  });

  test("shows validation error for invalid quantity", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-edit-err.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(request, auth.accessToken, "Bread", 3);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByTestId("item-quantity-input").fill("0");
    await page.getByTestId("item-details-save").click();

    await expect(page.getByTestId("item-details-error")).toContainText(
      "Quantity must be a positive number.",
    );
  });

  test("storage location can be changed and is persisted to backend", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-location.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(request, auth.accessToken, "Ice Cream", 30);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // Default is Pantry — select Freezer
    const locationSelect = page.getByTestId("item-storage-location-select");
    await expect(locationSelect).toBeVisible();
    await locationSelect.selectOption("Freezer");

    await page.getByTestId("item-details-save").click();
    await expect(page.getByTestId("item-details-message")).toContainText("Details saved.");

    // Subtitle in header reflects the new location
    await expect(page.getByText(/Freezer/)).toBeVisible();

    // Reload and confirm persistence
    await page.reload();
    await expect(page.getByTestId("item-storage-location-select")).toHaveValue("Freezer");

    // Confirm via API
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const items = (await listRes.json()) as Array<{ id: string; storageLocation: string }>;
    const saved = items.find((i) => i.id === item.id);
    expect(saved?.storageLocation).toBe("Freezer");
  });

  test("storage location filter shows only Fridge items", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-filter-fridge.${ts}@pantry-e2e.example.com`,
    );

    // Create one item in each location via API
    const fridgeRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { name: "Fridge Milk", quantity: 1, unit: "l", storageLocation: "Fridge" },
    });
    expect(fridgeRes.ok()).toBeTruthy();
    const pantryRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { name: "Pantry Pasta", quantity: 1, unit: "unit", storageLocation: "Pantry" },
    });
    expect(pantryRes.ok()).toBeTruthy();

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);

    // Fridge filter shows only fridge items
    await page.getByRole("button", { name: "Fridge" }).click();
    await expect(page.getByText("Fridge Milk")).toBeVisible();
    await expect(page.getByText("Pantry Pasta")).not.toBeVisible();

    // Pantry filter shows only pantry items
    await page.getByRole("button", { name: "Pantry" }).click();
    await expect(page.getByText("Pantry Pasta")).toBeVisible();
    await expect(page.getByText("Fridge Milk")).not.toBeVisible();
  });

  test("notes entered on the add form are visible and editable in item edit", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-notes.${ts}@pantry-e2e.example.com`,
    );

    // Create item with notes via API (simulating what the add form does after our fix)
    const createRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { name: "Organic Oats", quantity: 1, unit: "unit", notes: "Bought at Mercadona aisle 3" },
    });
    expect(createRes.ok()).toBeTruthy();
    const item = (await createRes.json()) as { id: string };

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // Notes field should be pre-populated
    await expect(page.getByTestId("item-notes-input")).toHaveValue("Bought at Mercadona aisle 3");
  });

  test("notes can be edited in item details and are persisted", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-notes-edit.${ts}@pantry-e2e.example.com`,
    );

    const createRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { name: "Brown Rice", quantity: 1, unit: "unit", notes: "Original note" },
    });
    expect(createRes.ok()).toBeTruthy();
    const item = (await createRes.json()) as { id: string };

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // Update the notes
    const notesInput = page.getByTestId("item-notes-input");
    await notesInput.fill("Updated note from edit");

    await page.getByTestId("item-details-save").click();
    await expect(page.getByTestId("item-details-message")).toContainText("Details saved.");

    // Reload and confirm persistence
    await page.reload();
    await expect(page.getByTestId("item-notes-input")).toHaveValue("Updated note from edit");

    // Confirm via API
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const items = (await listRes.json()) as Array<{ id: string; notes: string | null }>;
    const saved = items.find((i) => i.id === item.id);
    expect(saved?.notes).toBe("Updated note from edit");
  });

  test("notes are preserved when an item is consumed and re-added", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.readd-notes.${ts}@pantry-e2e.example.com`,
    );

    // Create item with notes
    const createRes = await request.post(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { name: "Feta Cheese", quantity: 1, unit: "unit", notes: "Greek brand, salty" },
    });
    expect(createRes.ok()).toBeTruthy();
    const item = (await createRes.json()) as { id: string };

    // Consume the item
    const consumeRes = await request.post(`${API_BASE_URL}/pantry/items/${item.id}/events`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      data: { type: "CONSUMED" },
    });
    expect(consumeRes.ok()).toBeTruthy();

    // Re-add via UI
    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByRole("button", { name: "Consumed" }).click();
    await expect(page.getByText("Feta Cheese")).toBeVisible();
    await page.getByTestId(/event-readd-/).first().click();
    await expect(page.getByTestId("re-add-success")).toBeVisible();

    // Confirm notes are preserved via API
    const listRes = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const items = (await listRes.json()) as Array<{ name: string; notes: string | null }>;
    const restored = items.find((i) => i.name === "Feta Cheese");
    expect(restored?.notes).toBe("Greek brand, salty");

    // Navigate to item detail and verify notes are visible
    const listRes2 = await request.get(`${API_BASE_URL}/pantry/items`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    });
    const items2 = (await listRes2.json()) as Array<{ id: string; name: string }>;
    const restoredItem = items2.find((i) => i.name === "Feta Cheese");
    await page.goto(`${FRONT_BASE_URL}/item/${restoredItem!.id}`);
    await expect(page.getByTestId("item-notes-input")).toHaveValue("Greek brand, salty");
  });

  test("price per unit auto-computes price paid and both are persisted", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.item-unit-price.${ts}@pantry-e2e.example.com`,
    );

    const item = await createAndGetPantryItem(request, auth.accessToken, "Olive Oil", 180);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    // Set quantity to 2 and unit price to 3.50 → price paid should auto-compute to 7.00
    await page.getByTestId("item-quantity-input").fill("2");
    await page.getByTestId("item-unit-price-input").fill("3.50");

    await expect(page.getByTestId("item-price-input")).toHaveValue("7.00");

    await page.getByTestId("item-details-save").click();
    await expect(page.getByTestId("item-details-message")).toContainText("Details saved.");

    // Reload and confirm both values persist
    await page.reload();
    await expect(page.getByTestId("item-quantity-input")).toHaveValue("2");
    await expect(page.getByTestId("item-unit-price-input")).toHaveValue("3.50");
    await expect(page.getByTestId("item-price-input")).toHaveValue("7.00");
  });
});
