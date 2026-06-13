import { expect, test } from "@playwright/test";
import {
  createAndGetPantryItem,
  registerUser,
  seedSession,
} from "../notifications/_helpers";

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
});
