import { expect, test } from "@playwright/test";
import { createPantryItem, registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

test.describe("Price comparison unmatched flow", () => {
  test("shows no-data guidance when catalog entry is missing", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(
      request,
      `pw.tkt006.unmatched.${ts}@insights-e2e.example.com`,
    );

    await createPantryItem(request, auth.accessToken, `Unknown Product ${ts}`, 5);

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByText(`Unknown Product ${ts}`, { exact: true }).click();

    const compareAction = page.getByTestId("compare-price-action");
    await expect(compareAction).toHaveAttribute("href", /compare-price/);
    await Promise.all([
      page.waitForURL(/\/compare-price\//),
      compareAction.click(),
    ]);

    await expect(page.getByTestId("price-comparison-no-data")).toBeVisible();
    await expect(page.getByTestId("price-comparison-guidance")).toContainText(
      "We do not have a reference price for this product yet",
    );
    await expect(page.getByTestId("price-comparison-result")).toHaveCount(0);
  });
});
