import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";
const FRONT_BASE_URL =
  process.env.E2E_FRONT_BASE_URL ?? "http://localhost:5173";

function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path}`;
}

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

interface PantryItemResponse {
  id: string;
  name: string;
}

async function registerUser(
  request: APIRequestContext,
  email: string,
): Promise<AuthResponse> {
  const response = await request.post(apiUrl("auth/register"), {
    data: {
      email,
      password: "password123",
    },
  });

  expect(response.status()).toBe(201);
  return (await response.json()) as AuthResponse;
}

async function createPantryItem(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<PantryItemResponse> {
  const response = await request.post(apiUrl("pantry/items"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name,
      quantity: 1,
      unit: "unit",
    },
  });

  expect(response.status()).toBe(201);
  return (await response.json()) as PantryItemResponse;
}

async function seedSession(page: Page, auth: AuthResponse): Promise<void> {
  await page.addInitScript((session) => {
    window.localStorage.setItem("rsf.auth.token", session.accessToken);
    window.localStorage.setItem("rsf.auth.user", JSON.stringify(session.user));
  }, auth);
}

test.describe("TKT-004 UI interactions", () => {
  test("shows estimate result and confidence badge on item detail", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.ui.known.${ts}@example.com`);
    const item = await createPantryItem(request, auth.accessToken, "Greek Yogurt");

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await expect(page.getByRole("heading", { name: "Greek Yogurt" })).toBeVisible();
    await page.getByRole("button", { name: "Estimate expiration" }).click();

    await expect(page.getByText("Suggestion generated. Review confidence before saving.")).toBeVisible();
    await expect(page.getByText("Suggested date:")).toBeVisible();
    await expect(page.getByText("High confidence")).toBeVisible();
  });

  test("shows low confidence for unknown product", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.ui.low.${ts}@example.com`);
    const item = await createPantryItem(request, auth.accessToken, "Mystery Ingredient 42");

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByRole("button", { name: "Estimate expiration" }).click();
    await expect(page.getByText("Low confidence")).toBeVisible();
  });

  test("validates override date required and allows saving override", async ({ page, request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.ui.override.${ts}@example.com`);
    const item = await createPantryItem(request, auth.accessToken, "Fresh Milk");

    await seedSession(page, auth);
    await page.goto(`${FRONT_BASE_URL}/item/${item.id}`);

    await page.getByRole("button", { name: "Save override" }).click();
    await expect(page.getByText("Please select an expiration date.")).toBeVisible();

    await page.locator('input[type="date"]').fill("2026-12-31");
    await page.getByRole("button", { name: "Save override" }).click();
    await expect(page.getByText("Expiration date saved.")).toBeVisible();
  });
});
