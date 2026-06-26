import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

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

export interface WasteMetricsResponse {
  totalWastedQuantity: number;
  totalWastedValueEur: string;
  eventCount: number;
}

export function getWasteMetrics(): Promise<WasteMetricsResponse> {
  return requestJson<WasteMetricsResponse>("/insights/waste", { method: "GET" });
}
