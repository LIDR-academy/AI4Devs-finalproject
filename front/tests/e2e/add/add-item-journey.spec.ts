import { expect, test, type Page } from "@playwright/test";
import { registerUser, seedSession } from "../notifications/_helpers";

const FRONT_BASE_URL = process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

/**
 * TKT-012 — manual add-item flow end-to-end journeys.
 *
 * The pantry list API is mocked statefully: GET returns the current items, POST
 * appends a created item. This keeps the scenarios deterministic without a
 * backend while exercising the real UI (validation, analytics, toast, highlight,
 * filter preservation).
 */

interface MockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePaid: string | null;
  expirationDate: string | null;
  createdAt: string;
}

async function mockPantryItems(page: Page, seed: MockItem[] = []) {
  const items = [...seed];
  let createCount = 0;

  await page.route("**/pantry/items", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      createCount += 1;
      const body = request.postDataJSON() as Partial<MockItem>;
      const created: MockItem = {
        id: `item-${createCount}`,
        name: String(body.name),
        quantity: Number(body.quantity ?? 1),
        unit: String(body.unit ?? "unit"),
        pricePaid: typeof body.pricePaid === "number" ? Number(body.pricePaid).toFixed(2) : null,
        expirationDate: body.expirationDate ?? null,
        createdAt: new Date().toISOString(),
      };
      items.push(created);
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(created),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(items),
    });
  });

  // Pantry also requests consumption events for the Consumed/Wasted filters.
  await page.route("**/pantry/items/events**", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  return {
    getCreateCount: () => createCount,
  };
}

async function fillManualForm(page: Page, name: string, quantity = "2") {
  await page.getByTestId("manual-name-input").fill(name);
  await page.getByTestId("manual-quantity-input").fill(quantity);
}

test.describe("TKT-012 manual add-item flow", () => {
  // Scenario 1 — complete journey from pantry through add and back to the list.
  test("Scenario 1 — full add journey shows new item in pantry list", async ({ page, request }) => {
    const auth = await registerUser(request, `pw.add012.journey.${Date.now()}@example.com`);
    await mockPantryItems(page);
    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByRole("link", { name: "Add" }).click();
    await expect(page).toHaveURL(/\/add$/);

    await page.getByRole("button", { name: "Manual entry" }).click();
    await expect(page).toHaveURL(/\/add\/manual/);

    await fillManualForm(page, "Greek Yogurt", "2");
    await page.getByTestId("manual-save-btn").click();

    await expect(page).toHaveURL(/\/pantry/);
    await expect(page.getByText("Greek Yogurt")).toBeVisible();
  });

  // Scenario 2 — inline, accessible validation on invalid submit.
  test("Scenario 2 — invalid submit shows field-level errors with aria attributes", async ({
    page,
    request,
  }) => {
    const auth = await registerUser(request, `pw.add012.valid.${Date.now()}@example.com`);
    await mockPantryItems(page);
    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/add/manual`);
    await page.getByTestId("manual-name-input").fill("");
    await page.getByTestId("manual-save-btn").click();

    const nameError = page.getByTestId("manual-name-error");
    await expect(nameError).toBeVisible();
    await expect(nameError).toHaveText("Name is required.");
    await expect(page.getByTestId("manual-name-input")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("manual-name-input")).toHaveAttribute(
      "aria-describedby",
      "manual-name-error",
    );
  });

  // Scenario 3 — submit is unavailable while the request is in flight (dedupe).
  test("Scenario 3 — submit button is disabled while saving, preventing duplicates", async ({
    page,
    request,
  }) => {
    const auth = await registerUser(request, `pw.add012.loading.${Date.now()}@example.com`);
    let resolveCreate: (() => void) | null = null;

    await page.route("**/pantry/items", async (route) => {
      if (route.request().method() === "POST") {
        await new Promise<void>((resolve) => {
          resolveCreate = resolve;
        });
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ id: "item-1", name: "Milk", quantity: 1, unit: "l" }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route("**/pantry/items/events**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add/manual`);
    await fillManualForm(page, "Milk", "1");

    const saveButton = page.getByTestId("manual-save-btn");
    await saveButton.click();
    await expect(saveButton).toBeDisabled();
    // Second click while disabled must be a no-op.
    await saveButton.click({ force: true }).catch(() => undefined);

    if (resolveCreate) {
      (resolveCreate as () => void)();
    }
    await expect(page).toHaveURL(/\/pantry/);
  });

  // Scenario 4 — success toast + highlighted item on return.
  test("Scenario 4 — success feedback and new item highlight", async ({ page, request }) => {
    const auth = await registerUser(request, `pw.add012.success.${Date.now()}@example.com`);
    await mockPantryItems(page);
    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/add/manual`);
    await fillManualForm(page, "Cheddar", "1");
    await page.getByTestId("manual-save-btn").click();

    // Toast appears before navigation.
    await expect(page.getByText(/added to your pantry/i)).toBeVisible();

    await expect(page).toHaveURL(/\/pantry/);
    await expect(page.getByTestId("pantry-item-highlighted")).toBeVisible();
    await expect(page.getByTestId("pantry-item-highlighted")).toContainText("Cheddar");
  });

  // Scenario 5 — pantry filter/search preserved across the add round-trip.
  test("Scenario 5 — pantry search/filter is preserved after visiting add", async ({
    page,
    request,
  }) => {
    const auth = await registerUser(request, `pw.add012.filter.${Date.now()}@example.com`);
    await mockPantryItems(page, [
      {
        id: "seed-1",
        name: "Spinach",
        quantity: 1,
        unit: "unit",
        pricePaid: null,
        expirationDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]);
    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/pantry`);
    await page.getByPlaceholder("Search pantry").fill("Spinach");

    await page.getByRole("link", { name: "Add" }).click();
    await expect(page).toHaveURL(/\/add$/);

    await page.getByRole("link", { name: "Pantry" }).click();
    await expect(page).toHaveURL(/\/pantry/);
    await expect(page.getByPlaceholder("Search pantry")).toHaveValue("Spinach");
  });

  // Scenario 6 — API failures: retry-friendly 5xx and household-access 403.
  test("Scenario 6 — server and authorization errors show appropriate messages", async ({
    page,
    request,
  }) => {
    const auth = await registerUser(request, `pw.add012.error.${Date.now()}@example.com`);
    let status = 500;

    await page.route("**/pantry/items", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status,
          contentType: "application/json",
          body: JSON.stringify({ message: "failure" }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
    await page.route("**/pantry/items/events**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
    );

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/add/manual`);
    await fillManualForm(page, "Eggs", "6");

    await page.getByTestId("manual-save-btn").click();
    await expect(page.getByTestId("manual-form-error")).toContainText(/try again/i);

    // Now switch to a 403 and resubmit.
    status = 403;
    await page.getByTestId("manual-save-btn").click();
    await expect(page.getByTestId("manual-form-error")).toContainText(/household/i);
  });

  // Scenario 7 — analytics events fire at the right moments with no sensitive data.
  test("Scenario 7 — analytics events are emitted without sensitive data", async ({
    page,
    request,
  }) => {
    const auth = await registerUser(request, `pw.add012.analytics.${Date.now()}@example.com`);
    await mockPantryItems(page);
    await seedSession(page, auth);

    await page.goto(`${FRONT_BASE_URL}/add/manual`);
    await fillManualForm(page, "Butter", "1");
    await page.getByTestId("manual-save-btn").click();
    await expect(page).toHaveURL(/\/pantry/);

    const events = await page.evaluate(
      () =>
        (
          window as unknown as {
            __RSF_ANALYTICS__?: Array<{ name: string; props?: Record<string, unknown> }>;
          }
        ).__RSF_ANALYTICS__ ?? [],
    );
    const names = events.map((e) => e.name);
    expect(names).toContain("pantry_add_item_opened");
    expect(names).toContain("pantry_add_item_submitted");
    expect(names).toContain("pantry_add_item_success");

    // No event payload should carry raw values, tokens, or emails.
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain("Butter");
    expect(serialized).not.toContain(auth.accessToken);
    expect(serialized).not.toContain("@example.com");
  });
});
