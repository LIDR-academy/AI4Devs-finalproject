import type { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path}`;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

export async function registerUser(
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

export async function createPantryItem(
  request: APIRequestContext,
  token: string,
  name: string,
  daysToExpire: number,
): Promise<void> {
  await createAndGetPantryItem(request, token, name, daysToExpire);
}

export async function createAndGetPantryItem(
  request: APIRequestContext,
  token: string,
  name: string,
  daysToExpire: number,
): Promise<{ id: string; name: string }> {
  const expirationDate = new Date();
  expirationDate.setUTCHours(12, 0, 0, 0);
  expirationDate.setUTCDate(expirationDate.getUTCDate() + daysToExpire);

  const response = await request.post(apiUrl("pantry/items"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      name,
      quantity: 1,
      unit: "unit",
      expirationDate: expirationDate.toISOString(),
    },
  });

  expect(response.status()).toBe(201);
  return (await response.json()) as { id: string; name: string };
}

export async function seedSession(page: Page, auth: AuthResponse): Promise<void> {
  await page.addInitScript((session) => {
    window.localStorage.setItem("rsf.auth.token", session.accessToken);
    window.localStorage.setItem("rsf.auth.user", JSON.stringify(session.user));
  }, auth);
}

export async function callNotificationsEndpoint(
  request: APIRequestContext,
  token: string,
  method: "GET" | "POST",
  path: string,
): Promise<unknown> {
  const response = await request.fetch(apiUrl(path), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  expect(response.ok()).toBeTruthy();
  return await response.json();
}
