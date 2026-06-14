import { expect, test } from "@playwright/test";
import { createAndGetPantryItem, registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

test.describe("Add flows: manual and receipt review", () => {
  test("manual entry sends pricePaid when provided", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.manual.${ts}@example.com`);

    let createPantryPayload: Record<string, unknown> | null = null;

    await page.route("**/pantry/items", async (route) => {
      if (route.request().method() === "POST") {
        createPantryPayload = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "item-1",
            name: createPantryPayload.name,
            quantity: createPantryPayload.quantity,
            unit: createPantryPayload.unit,
            expirationDate: createPantryPayload.expirationDate ?? null,
            pricePaid:
              typeof createPantryPayload.pricePaid === "number"
                ? Number(createPantryPayload.pricePaid).toFixed(2)
                : null,
            createdAt: new Date().toISOString(),
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/add/manual`);

    await page.getByPlaceholder("e.g. Greek Yogurt").fill("Greek Yogurt");
    await page.getByPlaceholder("1").fill("1");
    await page.getByPlaceholder("2.40").fill("4.75");
    await page.locator('input[type="date"]').first().fill("2026-12-31");
    await expect(page.getByRole("button", { name: "Save item" })).toBeEnabled();

    await page.getByRole("button", { name: "Save item" }).click();

    expect(createPantryPayload).toBeTruthy();
    expect(createPantryPayload?.name).toBe("Greek Yogurt");
    expect(createPantryPayload?.pricePaid).toBe(4.75);
    expect(createPantryPayload?.expirationDate).toBe("2026-12-31");
  });

  test("receipt review pre-fills default expiration and allows editing before confirmation", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.receipt.${ts}@example.com`);

    const receiptResponse = {
      id: "receipt-1",
      originalFilename: "receipt.png",
      mimeType: "image/png",
      sizeBytes: 1234,
      storageBucket: "test-bucket",
      storageKey: "receipts/receipt-1.png",
      ocrStatus: "COMPLETED" as const,
      ocrError: null,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: "line-1",
          rawName: "Milk",
          quantity: 1,
          unit: "l",
          unitPriceEur: "1.20",
          lineTotalEur: "1.20",
          defaultExpirationDate: "2026-07-01T00:00:00.000Z",
          userConfirmed: false,
          pantryItemId: null,
        },
        {
          id: "line-2",
          rawName: "Bread",
          quantity: 2,
          unit: "unit",
          unitPriceEur: "1.10",
          lineTotalEur: "2.20",
          defaultExpirationDate: "2026-06-20T00:00:00.000Z",
          userConfirmed: false,
          pantryItemId: null,
        },
      ],
    };

    let confirmPayload: Record<string, unknown> | null = null;
    let uploadCalled = false;

    await page.route("**/receipts/upload", async (route) => {
      uploadCalled = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(receiptResponse),
      });
    });

    await page.route("**/receipts/receipt-1/confirm-items", async (route) => {
      confirmPayload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ...receiptResponse,
          items: receiptResponse.items.map((item) => ({
            ...item,
            userConfirmed: true,
            pantryItemId: `pantry-${item.id}`,
          })),
        }),
      });
    });

    await page.route("**/pantry/items", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/add`);

    await page.locator('input[type="file"]').setInputFiles({
      name: "receipt.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image"),
    });
    await expect.poll(() => uploadCalled).toBe(true);

    await expect(page.getByText("Receipt review")).toBeVisible();
    await expect(page.getByTestId("receipt-expiration-line-1")).toHaveValue("2026-07-01");
    await expect(page.getByTestId("receipt-price-line-1")).toHaveValue("1.20");

    await page.getByTestId("receipt-expiration-line-1").fill("2026-07-03");
    await page.getByTestId("receipt-price-line-1").fill("1.55");

    await page.getByRole("button", { name: "Confirm selected items" }).click();

    expect(confirmPayload).toBeTruthy();
    expect(confirmPayload?.addToPantry).toBe(true);
    expect(confirmPayload?.itemIds).toEqual(["line-1", "line-2"]);

    const itemOverrides = confirmPayload?.itemOverrides as Array<Record<string, unknown>>;
    expect(itemOverrides).toHaveLength(2);

    const editedLine = itemOverrides.find((override) => override.itemId === "line-1");
    expect(editedLine?.pricePaid).toBe(1.55);
    expect(editedLine?.expirationDate).toBe("2026-07-03T00:00:00.000Z");
  });

  test("receipt review shows labels, unit price, quantity and emoji picker", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.receipt-labels.${ts}@example.com`);

    const receiptResponse = {
      id: "receipt-labels",
      originalFilename: "receipt.png",
      mimeType: "image/png",
      sizeBytes: 1234,
      storageBucket: "test-bucket",
      storageKey: "receipts/receipt-labels.png",
      ocrStatus: "COMPLETED" as const,
      ocrError: null,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: "lbl-1",
          rawName: "Cheese",
          quantity: 2,
          unit: "unit",
          unitPriceEur: "2.50",
          lineTotalEur: "5.00",
          defaultExpirationDate: "2026-07-15T00:00:00.000Z",
          userConfirmed: false,
          pantryItemId: null,
        },
      ],
    };

    await page.route("**/receipts/upload", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(receiptResponse),
      });
    });
    await page.route("**/pantry/items", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add`);

    await page.locator('input[type="file"]').setInputFiles({
      name: "receipt.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-image"),
    });

    await expect(page.getByText("Receipt review")).toBeVisible();

    // All labels visible
    await expect(page.getByText("Expiration date")).toBeVisible();
    await expect(page.getByText("Units")).toBeVisible();
    await expect(page.getByText("Unit price (€)")).toBeVisible();
    await expect(page.getByText("Total price (€)")).toBeVisible();

    // Fields pre-filled from receipt data
    await expect(page.getByTestId("receipt-quantity-lbl-1")).toHaveValue("2");
    await expect(page.getByTestId("receipt-unit-price-lbl-1")).toHaveValue("2.50");
    await expect(page.getByTestId("receipt-price-lbl-1")).toHaveValue("5.00");

    // Emoji picker button is visible
    await expect(page.getByTestId("receipt-emoji-btn-lbl-1")).toBeVisible();

    // Changing unit price auto-recalculates total (2 units × €3.00 = €6.00)
    await page.getByTestId("receipt-unit-price-lbl-1").fill("3.00");
    await expect(page.getByTestId("receipt-price-lbl-1")).toHaveValue("6.00");

    // Changing quantity auto-recalculates total (3 units × €3.00 = €9.00)
    await page.getByTestId("receipt-quantity-lbl-1").fill("3");
    await expect(page.getByTestId("receipt-price-lbl-1")).toHaveValue("9.00");
  });

  test("Photo of product button shows MVP unavailable alert", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.mvp-photo.${ts}@example.com`);

    await page.route("**/pantry/items", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add`);

    await page.getByText("Photo of product").click();

    await expect(page.getByTestId("mvp-unavailable-alert")).toBeVisible();
    await expect(page.getByTestId("mvp-unavailable-alert")).toContainText("not available");
  });

  test("Voice add button shows MVP unavailable alert", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.mvp-voice.${ts}@example.com`);

    await page.route("**/pantry/items", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add`);

    await page.getByText("Voice add").click();

    await expect(page.getByTestId("mvp-unavailable-alert")).toBeVisible();
    await expect(page.getByTestId("mvp-unavailable-alert")).toContainText("not available");
  });

  test("recently added section shows real pantry items", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.recent.${ts}@example.com`);

    const item = await createAndGetPantryItem(request, auth.accessToken, "Fresh Tomatoes", 5);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add`);

    await expect(page.getByTestId("recently-added-section")).toBeVisible();
    await expect(page.getByText("Fresh Tomatoes")).toBeVisible();
    await expect(page.getByTestId(`recent-item-${item.id}`)).toBeVisible();
  });

  test("estimate expiration at manual entry pre-fills date and shows result", async ({
    page,
    request,
  }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.add.estimate.${ts}@example.com`);

    await page.route("**/pantry/items/estimate-by-name**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          suggestedExpirationDate: "2026-07-21T00:00:00.000Z",
          confidence: 0.86,
          method: "RULE_BASED_SPAIN",
          lowConfidence: false,
          category: "dairy",
        }),
      });
    });

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add/manual`);

    // Estimate button is disabled until name is filled
    await expect(page.getByTestId("manual-estimate-expiration-btn")).toBeDisabled();

    await page.getByPlaceholder("e.g. Greek Yogurt").fill("Milk");
    await expect(page.getByTestId("manual-estimate-expiration-btn")).toBeEnabled();

    await page.getByTestId("manual-estimate-expiration-btn").click();

    // Estimate result shown
    await expect(page.getByTestId("manual-estimate-result")).toBeVisible();
    await expect(page.getByTestId("manual-estimate-result")).toContainText("dairy");

    // Date pre-filled
    await expect(page.getByTestId("manual-expiration-input")).toHaveValue("2026-07-21");
  });
});
