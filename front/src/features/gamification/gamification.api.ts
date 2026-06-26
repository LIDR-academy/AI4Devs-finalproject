import { getAccessToken } from "@/features/auth/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

interface ApiErrorBody {
  message?: string | string[];
}

export interface SummaryBadge {
  id: string;
  code: string;
  earnedAt: string;
  label: string;
  description: string;
}

export interface GamificationSummary {
  totalPoints: number;
  totalValueSavedEur: number;
  totalValueWastedEur: number;
  consumedBeforeExpiryCount: number;
  wastedCount: number;
  badges: SummaryBadge[];
  weeklyStreak: number;
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No session found");
  }
  return { Authorization: `Bearer ${token}` };
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

export function getGamificationSummary(): Promise<GamificationSummary> {
  return requestJson<GamificationSummary>("/gamification/summary", { method: "GET" });
}

export type HistoryEventType = "POINTS_EARNED" | "POINTS_DEDUCTED" | "BADGE_EARNED";

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  points: number | null;
  badgeCode: string | null;
  reason: string;
  occurredAt: string;
}

export interface PointsHistoryPage {
  events: HistoryEvent[];
  total: number;
}

export function getPointsHistory(limit: number, offset: number): Promise<PointsHistoryPage> {
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return requestJson<PointsHistoryPage>(`/gamification/history?${query.toString()}`, {
    method: "GET",
  });
}
