import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export interface PantryApiItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expirationDate: string | null;
  createdAt: string;
}

export interface CreatePantryItemPayload {
  name: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

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
