import { getAccessToken } from "@/features/auth/session";

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:3000/api`
    : "http://localhost:3000/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const PANTRY_UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;
export type PantryUnit = (typeof PANTRY_UNITS)[number];

export const STORAGE_LOCATIONS = ["Pantry", "Fridge", "Freezer"] as const;
export type StorageLocation = (typeof STORAGE_LOCATIONS)[number];

export interface PantryApiItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  storageLocation: string;
  pricePaid: string | null;
  expirationDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface UpdatePantryItemPayload {
  quantity?: number;
  unit?: string;
  storageLocation?: string;
  pricePaid?: number;
  notes?: string;
}

export type PantryEventType = "CONSUMED" | "WASTED";

export interface CreatePantryItemPayload {
  name: string;
  quantity: number;
  unit: string;
  storageLocation?: string;
  expirationDate?: string;
  pricePaid?: number;
  notes?: string;
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
  code?: string;
  itemName?: string;
  daysPastExpiry?: number;
}

/**
 * Error carrying the HTTP status so callers can branch on it (e.g. 403 → household
 * access warning, 5xx → retry-friendly message). Extends Error, so existing
 * `instanceof Error` / `.message` consumers keep working unchanged.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class WasteConfirmationRequiredError extends Error {
  readonly code = "WASTE_CONFIRMATION_REQUIRED" as const;
  constructor(
    public readonly itemName: string,
    public readonly daysPastExpiry: number,
  ) {
    super("Waste confirmation required");
  }
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
    throw new ApiError(response.status, message);
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

export interface ConsumptionEventRecord {
  id: string;
  type: "CONSUMED" | "WASTED";
  quantity: number;
  itemName: string | null;
  itemUnit: string | null;
  itemExpirationDate: string | null;
  itemPricePaid: string | null;
  itemNotes: string | null;
  estimatedValueEur: string | null;
  occurredAt: string;
}

export function listConsumptionEvents(
  type?: "CONSUMED" | "WASTED",
): Promise<ConsumptionEventRecord[]> {
  const query = type ? `?type=${type}` : "";
  return requestJson<ConsumptionEventRecord[]>(`/pantry/items/events${query}`, {
    method: "GET",
  });
}

/**
 * Re-adds a consumed/wasted item back into the pantry from its history event.
 * The backend recreates the pantry item and deletes the event atomically, so the
 * event will no longer appear in the consumed/wasted list afterwards.
 */
export function reAddConsumptionEvent(eventId: string): Promise<PantryApiItem> {
  return requestJson<PantryApiItem>(`/pantry/items/events/${eventId}/re-add`, {
    method: "POST",
  });
}

export interface QuickExpirationEstimate {
  suggestedExpirationDate: string;
  confidence: number;
  method: "RULE_BASED_SPAIN";
  lowConfidence: boolean;
  category: string;
}

export function estimateExpirationByName(
  name: string,
): Promise<QuickExpirationEstimate> {
  const query = new URLSearchParams({ name });
  return requestJson<QuickExpirationEstimate>(
    `/pantry/items/estimate-by-name?${query.toString()}`,
    { method: "GET" },
  );
}

export interface UseNextItem {
  pantryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePaid: string | null;
  expirationDate: string | null;
  daysUntilExpiration: number | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface UseNextResponse {
  items: UseNextItem[];
}

export function getUseNextItems(): Promise<UseNextResponse> {
  return requestJson<UseNextResponse>("/pantry/use-next", { method: "GET" });
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

export async function registerPantryItemEvent(
  pantryItemId: string,
  type: PantryEventType,
  options: { confirmed?: boolean; quantity?: number } = {},
): Promise<{ id: string }> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/pantry/items/${pantryItemId}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, ...options }),
    });
  } catch {
    throw new Error(
      `Cannot connect to API at ${API_BASE_URL}. Ensure backend is running (cd back && npm run start:dev).`,
    );
  }

  if (response.status === 409) {
    const body = (await response.json().catch(() => ({}))) as ApiErrorBody;
    if (body.code === "WASTE_CONFIRMATION_REQUIRED") {
      throw new WasteConfirmationRequiredError(body.itemName ?? "Item", body.daysPastExpiry ?? 0);
    }
  }

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorBody;
    const message = Array.isArray(errorBody.message)
      ? errorBody.message.join(", ")
      : (errorBody.message ?? "Request failed");
    throw new Error(message);
  }

  return (await response.json()) as { id: string };
}
