import type { OperationalDashboard } from "../types/dashboard";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

export async function fetchOperationalDashboard(): Promise<OperationalDashboard> {
  const response = await fetch(`${backendUrl}/dashboard/operational`);

  if (!response.ok) {
    throw new Error(`Backend returned HTTP ${response.status}`);
  }

  return response.json() as Promise<OperationalDashboard>;
}
