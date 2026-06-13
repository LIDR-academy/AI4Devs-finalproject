import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

interface ApiErrorBody {
  message?: string | string[];
}

export interface DashboardSummaryResponse {
  activeItems: number;
  expiringSoonItems: number;
  generatedAt: string;
}

export interface DashboardUseNextItem {
  pantryItemId: string;
  name: string;
  quantity: number;
  unit: string;
  pricePaid: string | null;
  expirationDate: string | null;
  daysUntilExpiration: number | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

export interface DashboardUseNextResponse {
  items: DashboardUseNextItem[];
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

export function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return requestJson<DashboardSummaryResponse>("/dashboard/summary", {
    method: "GET",
  });
}

export function getDashboardUseNext(): Promise<DashboardUseNextResponse> {
  return requestJson<DashboardUseNextResponse>("/dashboard/use-next", {
    method: "GET",
  });
}
