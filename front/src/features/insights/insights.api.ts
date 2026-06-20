import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

interface ApiErrorBody {
  message?: string | string[];
}

export interface PriceComparisonResponse {
  normalizedName: string;
  found: boolean;
  reference: {
    normalizedName: string;
    category: string | null;
    sourceLabel: string | null;
    referencePriceEur: string;
    currencyCode: string;
    effectiveDate: string;
  } | null;
  receiptContext: {
    latestUnitPriceEur: string | null;
    latestObservedAt: string | null;
  };
  unavailableReason: "NO_REFERENCE_DATA" | null;
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

export function getPriceComparison(normalizedName: string): Promise<PriceComparisonResponse> {
  const query = new URLSearchParams({ normalizedName });
  return requestJson<PriceComparisonResponse>(`/insights/price-comparison?${query.toString()}`, {
    method: "GET",
  });
}

export interface WasteMetricsResponse {
  totalWastedQuantity: number;
  totalWastedValueEur: string;
  eventCount: number;
}

export function getWasteMetrics(): Promise<WasteMetricsResponse> {
  return requestJson<WasteMetricsResponse>("/insights/waste", { method: "GET" });
}
