import { expect, test, type APIRequestContext } from "@playwright/test";

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path}`;
}

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

interface PantryItemResponse {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: string | null;
  createdAt: string;
}

interface EstimateResponse {
  pantryItemId: string;
  itemName: string;
  suggestedExpirationDate: string;
  confidence: number;
  method: "RULE_BASED_SPAIN" | "MANUAL_OVERRIDE";
  lowConfidence: boolean;
  category: string;
}

interface OverrideResponse {
  pantryItemId: string;
  expirationDate: string;
  assessment: {
    suggestedExpirationDate: string;
    confidence: number;
    method: "RULE_BASED_SPAIN" | "MANUAL_OVERRIDE";
    userConfirmed: boolean;
  };
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

test.describe("TKT-004 Expiration confidence flow", () => {
  test("returns suggestion with date, confidence and method for known category", async ({ request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.known.${ts}@example.com`);
    const item = await createPantryItem(request, auth.accessToken, "Greek Yogurt");

    const estimateResponse = await request.post(
      apiUrl(`pantry/items/${item.id}/estimate-expiration`),
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      },
    );

    expect(estimateResponse.status()).toBe(201);
    const body = (await estimateResponse.json()) as EstimateResponse;

    expect(body.pantryItemId).toBe(item.id);
    expect(body.itemName).toBe("Greek Yogurt");
    expect(body.suggestedExpirationDate).toBeTruthy();
    expect(Number.isNaN(Date.parse(body.suggestedExpirationDate))).toBeFalsy();
    expect(body.method).toBe("RULE_BASED_SPAIN");
    expect(body.confidence).toBeGreaterThanOrEqual(0.6);
    expect(body.lowConfidence).toBeFalsy();
  });

  test("marks unknown products with low confidence", async ({ request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.low.${ts}@example.com`);
    const item = await createPantryItem(
      request,
      auth.accessToken,
      "Mystery Ingredient 42",
    );

    const estimateResponse = await request.post(
      apiUrl(`pantry/items/${item.id}/estimate-expiration`),
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      },
    );

    expect(estimateResponse.status()).toBe(201);
    const body = (await estimateResponse.json()) as EstimateResponse;

    expect(body.category).toBe("unknown");
    expect(body.lowConfidence).toBeTruthy();
    expect(body.confidence).toBeLessThan(0.6);
  });

  test("allows manual override and returns manual override metadata", async ({ request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.override.${ts}@example.com`);
    const item = await createPantryItem(request, auth.accessToken, "Fresh Milk");

    const overrideResponse = await request.patch(apiUrl(`pantry/items/${item.id}/expiration`), {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      data: {
        expirationDate: "2026-12-31T00:00:00.000Z",
      },
    });

    expect(overrideResponse.status()).toBe(200);
    const body = (await overrideResponse.json()) as OverrideResponse;

    expect(body.pantryItemId).toBe(item.id);
    expect(body.expirationDate).toBe("2026-12-31T00:00:00.000Z");
    expect(body.assessment.method).toBe("MANUAL_OVERRIDE");
    expect(body.assessment.userConfirmed).toBeTruthy();
    expect(body.assessment.confidence).toBe(1);
  });

  test("rejects estimate without auth", async ({ request }) => {
    const response = await request.post(
      apiUrl("pantry/items/00000000-0000-0000-0000-000000000000/estimate-expiration"),
    );

    expect(response.status()).toBe(401);
  });

  test("rejects override without auth", async ({ request }) => {
    const response = await request.patch(
      apiUrl("pantry/items/00000000-0000-0000-0000-000000000000/expiration"),
      {
        data: {
          expirationDate: "2026-12-31T00:00:00.000Z",
        },
      },
    );

    expect(response.status()).toBe(401);
  });

  test("returns forbidden when another user tries to estimate item", async ({ request }) => {
    const ts = Date.now();
    const owner = await registerUser(request, `pw.tkt004.owner.${ts}@example.com`);
    const stranger = await registerUser(
      request,
      `pw.tkt004.stranger.${ts}@example.com`,
    );
    const item = await createPantryItem(request, owner.accessToken, "Greek Yogurt");

    const response = await request.post(apiUrl(`pantry/items/${item.id}/estimate-expiration`), {
      headers: {
        Authorization: `Bearer ${stranger.accessToken}`,
      },
    });

    expect(response.status()).toBe(403);
  });

  test("returns forbidden when another user tries to override item", async ({ request }) => {
    const ts = Date.now();
    const owner = await registerUser(request, `pw.tkt004.owner2.${ts}@example.com`);
    const stranger = await registerUser(
      request,
      `pw.tkt004.stranger2.${ts}@example.com`,
    );
    const item = await createPantryItem(request, owner.accessToken, "Greek Yogurt");

    const response = await request.patch(apiUrl(`pantry/items/${item.id}/expiration`), {
      headers: {
        Authorization: `Bearer ${stranger.accessToken}`,
      },
      data: {
        expirationDate: "2026-12-31T00:00:00.000Z",
      },
    });

    expect(response.status()).toBe(403);
  });

  test("returns not found for non-existent item", async ({ request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.notfound.${ts}@example.com`);

    const estimateResponse = await request.post(
      apiUrl("pantry/items/00000000-0000-0000-0000-000000000000/estimate-expiration"),
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      },
    );

    const overrideResponse = await request.patch(
      apiUrl("pantry/items/00000000-0000-0000-0000-000000000000/expiration"),
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
        data: {
          expirationDate: "2026-12-31T00:00:00.000Z",
        },
      },
    );

    expect(estimateResponse.status()).toBe(404);
    expect(overrideResponse.status()).toBe(404);
  });

  test("returns bad request for invalid override date payload", async ({ request }) => {
    const ts = Date.now();
    const auth = await registerUser(request, `pw.tkt004.badrequest.${ts}@example.com`);
    const item = await createPantryItem(request, auth.accessToken, "Greek Yogurt");

    const response = await request.patch(apiUrl(`pantry/items/${item.id}/expiration`), {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
      data: {
        expirationDate: "not-a-date",
      },
    });

    expect(response.status()).toBe(400);
  });
});
