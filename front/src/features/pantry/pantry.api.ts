import { getAccessToken } from "@/features/auth/session";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:3000/api`
    : "http://localhost:3000/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const PANTRY_UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;
export type PantryUnit = (typeof PANTRY_UNITS)[number];

export interface PantryApiItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePaid: string | null;
  expirationDate: string | null;
  createdAt: string;
}

export interface UpdatePantryItemPayload {
  quantity?: number;
  unit?: string;
  pricePaid?: number;
}

export type PantryEventType = "CONSUMED" | "WASTED";

export interface CreatePantryItemPayload {
  name: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  pricePaid?: number;
}

export interface ExpirationEstimateResponse {
  pantryItemId: string;
  itemName: string;
  suggestedExpirationDate: string;
  confidence: number;
  method: "RULE_BASED_SPAIN" | "MANUAL_OVERRIDE";
  lowConfidence: boolean;
  category: string;
}

export interface ExpirationOverrideResponse {
  pantryItemId: string;
  expirationDate: string;
  assessment: {
    suggestedExpirationDate: string;
    confidence: number;
    method: "RULE_BASED_SPAIN" | "MANUAL_OVERRIDE";
    userConfirmed: boolean;
  };
}

interface ApiErrorBody {
  message?: string | string[];
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running (cd back && npm run start:dev).`,
    );
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(errorBody.message)
      ? errorBody.message.join(", ")
      : (errorBody.message ?? "Request failed");
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function listPantryItems(): Promise<PantryApiItem[]> {
  return requestJson<PantryApiItem[]>("/pantry/items", {
    method: "GET",
  });
}

export function createPantryItem(
  payload: CreatePantryItemPayload,
): Promise<PantryApiItem> {
  return requestJson<PantryApiItem>("/pantry/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function estimateExpiration(
  pantryItemId: string,
): Promise<ExpirationEstimateResponse> {
  return requestJson<ExpirationEstimateResponse>(
    `/pantry/items/${pantryItemId}/estimate-expiration`,
    {
      method: "POST",
    },
  );
}

export function overrideExpiration(
  pantryItemId: string,
  expirationDate: string,
): Promise<ExpirationOverrideResponse> {
  return requestJson<ExpirationOverrideResponse>(
    `/pantry/items/${pantryItemId}/expiration`,
    {
      method: "PATCH",
      body: JSON.stringify({ expirationDate }),
    },
  );
}

export function updatePantryItem(
  pantryItemId: string,
  payload: UpdatePantryItemPayload,
): Promise<PantryApiItem> {
  return requestJson<PantryApiItem>(`/pantry/items/${pantryItemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function registerPantryItemEvent(
  pantryItemId: string,
  type: PantryEventType,
): Promise<{ id: string }> {
  return requestJson<{ id: string }>(`/pantry/items/${pantryItemId}/events`, {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}
