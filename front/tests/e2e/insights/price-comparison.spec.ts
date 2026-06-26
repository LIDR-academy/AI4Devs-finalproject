import { expect, test, type Page } from "@playwright/test";
import { registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

const MOCK_PANTRY_ITEM_ID = "pantry-item-1";
const MOCK_ITEM_NAME = "Leche Entera";

const MOCK_MERCADONA_FOUND_RESPONSE = {
  normalizedName: "leche entera",
  found: true,
  mercadona: {
    found: true,
    productName: "Leche entera Hacendado 1L",
    priceEur: "0.72",
    unit: "l",
    lastUpdatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    source: "MERCADONA_LIVE",
  },
  reference: null,
  receiptContext: { latestUnitPriceEur: "0.89", latestObservedAt: null },
  delta: "0.17",
  unavailableReason: null,
};

const MOCK_MERCADONA_CACHED_RESPONSE = {
  ...MOCK_MERCADONA_FOUND_RESPONSE,
  mercadona: {
    ...MOCK_MERCADONA_FOUND_RESPONSE.mercadona,
    source: "MERCADONA_CACHED",
  },
};

const MOCK_MERCADONA_NOT_FOUND_RESPONSE = {
  normalizedName: "leche entera",
  found: true,
  mercadona: {
    found: false,
    productName: null,
    priceEur: null,
    unit: null,
    lastUpdatedAt: null,
    source: null,
  },
  reference: {
    normalizedName: "leche entera",
    category: "Lácteos",
    sourceLabel: "Catalog v1",
    referencePriceEur: "0.75",
    currencyCode: "EUR",
    effectiveDate: "2026-01-01T00:00:00.000Z",
  },
  receiptContext: { latestUnitPriceEur: null, latestObservedAt: null },
  delta: null,
  unavailableReason: null,
};

async function mockPantryList(page: Page) {
  await page.route("**/pantry/items**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: MOCK_PANTRY_ITEM_ID,
          name: MOCK_ITEM_NAME,
          quantity: 1,
          unit: "unit",
          pricePaid: 0.89,
          expirationDate: null,
          createdAt: new Date().toISOString(),
        },
      ]),
    });
  });
}

test.describe("Price Comparison with Mercadona", () => {
  test("shows live Mercadona price, product name, and overpaid delta", async ({ page, request }) => {
    const email = `price-cmp-e2e-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockPantryList(page);

    await page.route("**/insights/price-comparison**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_MERCADONA_FOUND_RESPONSE),
      });
    });

    await page.goto(`${FRONT_BASE_URL}/compare-price/${MOCK_PANTRY_ITEM_ID}`);

    await expect(page.getByTestId("price-comparison-mercadona")).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("price-comparison-mercadona-price")).toHaveText("€0.72");
    await expect(page.getByTestId("price-comparison-mercadona-name")).toHaveText(
      "Leche entera Hacendado 1L",
    );
    await expect(page.getByTestId("price-comparison-last-updated")).toBeVisible();
    await expect(page.getByText(/overpaid/i)).toBeVisible();
    await expect(page.getByTestId("price-comparison-cached-badge")).not.toBeVisible();
  });

  test("shows (cached) badge when source is MERCADONA_CACHED", async ({ page, request }) => {
    const email = `price-cmp-e2e-cached-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockPantryList(page);

    await page.route("**/insights/price-comparison**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_MERCADONA_CACHED_RESPONSE),
      });
    });

    await page.goto(`${FRONT_BASE_URL}/compare-price/${MOCK_PANTRY_ITEM_ID}`);

    await expect(page.getByTestId("price-comparison-cached-badge")).toBeVisible({ timeout: 8000 });
    await expect(page.getByTestId("price-comparison-cached-badge")).toHaveText("cached");
  });

  test("shows fallback message and static catalog when Mercadona has no match", async ({
    page,
    request,
  }) => {
    const email = `price-cmp-e2e-fallback-${Date.now()}@example.com`;
    const auth = await registerUser(request, email);

    await seedSession(page, auth);
    await mockPantryList(page);

    await page.route("**/insights/price-comparison**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_MERCADONA_NOT_FOUND_RESPONSE),
      });
    });

    await page.goto(`${FRONT_BASE_URL}/compare-price/${MOCK_PANTRY_ITEM_ID}`);

    await expect(
      page.getByTestId("price-comparison-mercadona-unavailable"),
    ).toBeVisible({ timeout: 8000 });
    await expect(page.getByText(/no live price available/i)).toBeVisible();
    await expect(page.getByTestId("price-comparison-result")).toBeVisible();
    await expect(page.getByTestId("price-comparison-reference-price")).toHaveText("€0.75");
  });
});
