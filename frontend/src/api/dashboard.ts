import type { OperationalDashboard } from "../types/dashboard";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
const dashboardRefreshMs = import.meta.env.VITE_DASHBOARD_REFRESH_MS as string | undefined;
const DEFAULT_DASHBOARD_REFRESH_MS = 3000;
const MIN_DASHBOARD_REFRESH_MS = 1000;
const MAX_DASHBOARD_REFRESH_MS = 10000;

export function dashboardRefreshIntervalMs(): number {
  const parsed = Number(dashboardRefreshMs);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_DASHBOARD_REFRESH_MS;
  }
  return Math.min(MAX_DASHBOARD_REFRESH_MS, Math.max(MIN_DASHBOARD_REFRESH_MS, Math.round(parsed)));
}

export async function fetchOperationalDashboard(signal?: AbortSignal): Promise<OperationalDashboard> {
  const response = await fetch(`${backendUrl}/dashboard/operational`, { signal });

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }

  return response.json() as Promise<OperationalDashboard>;
}
