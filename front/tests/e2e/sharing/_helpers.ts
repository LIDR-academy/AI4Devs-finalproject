import type { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const API_BASE_URL = process.env.E2E_API_BASE_URL ?? "http://localhost:3000/api";

function apiUrl(path: string): string {
  return `${API_BASE_URL}/${path}`;
}

export interface AuthResponse {
  accessToken: string;
  user: { id: string; email: string; createdAt: string };
}

export interface HouseholdResponse {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
}

export interface InvitationResponse {
  id: string;
  householdId: string;
  inviteeEmail: string;
  status: string;
}

export async function registerUser(request: APIRequestContext, email: string): Promise<AuthResponse> {
  const res = await request.post(apiUrl("auth/register"), {
    data: { email, password: "password123" },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as AuthResponse;
}

export async function createHousehold(
  request: APIRequestContext,
  token: string,
  name = "E2E House",
): Promise<HouseholdResponse> {
  const res = await request.post(apiUrl("households"), {
    headers: { Authorization: `Bearer ${token}` },
    data: { name },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as HouseholdResponse;
}

export async function sendInvitation(
  request: APIRequestContext,
  token: string,
  householdId: string,
  inviteeEmail: string,
): Promise<InvitationResponse> {
  const res = await request.post(apiUrl(`households/${householdId}/invitations`), {
    headers: { Authorization: `Bearer ${token}` },
    data: { inviteeEmail },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as InvitationResponse;
}

export async function acceptInvitation(
  request: APIRequestContext,
  token: string,
  invitationId: string,
): Promise<void> {
  const res = await request.post(apiUrl(`invitations/${invitationId}/accept`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(201);
}

export async function createPantryItem(
  request: APIRequestContext,
  token: string,
  name: string,
): Promise<{ id: string }> {
  const res = await request.post(apiUrl("pantry/items"), {
    headers: { Authorization: `Bearer ${token}` },
    data: { name, quantity: 1, unit: "unit" },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as { id: string };
}

export async function seedSession(page: Page, auth: AuthResponse): Promise<void> {
  await page.addInitScript((session) => {
    window.localStorage.setItem("rsf.auth.token", session.accessToken);
    window.localStorage.setItem("rsf.auth.user", JSON.stringify(session.user));
  }, auth);
}
