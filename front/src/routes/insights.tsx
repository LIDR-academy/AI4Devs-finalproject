import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  getDashboardSummary,
  getDashboardUseNext,
  type DashboardSummaryResponse,
  type DashboardUseNextItem,
} from "@/features/dashboard/dashboard.api";
import {
  getWasteMetrics,
  type WasteMetricsResponse,
} from "@/features/insights/insights.api";
import {
  registerPantryItemEvent,
  type PantryEventType,
} from "@/features/pantry/pantry.api";
import {
  requireAuthBeforeLoad,
  useRequireAuthRedirect,
} from "@/features/auth/route-guard";

export const Route = createFileRoute("/insights")({
  beforeLoad: requireAuthBeforeLoad,
  component: InsightsPage,
});

function InsightsPage() {
  const authed = useRequireAuthRedirect();

  if (!authed) {
    return null;
  }

  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [useNext, setUseNext] = useState<DashboardUseNextItem[]>([]);
  const [wasteMetrics, setWasteMetrics] = useState<WasteMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const [summaryData, useNextData, wasteData] = await Promise.all([
        getDashboardSummary(),
        getDashboardUseNext(),
        getWasteMetrics(),
      ]);
      setSummary(summaryData);
      setUseNext(useNextData.items);
      setWasteMetrics(wasteData);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not load dashboard.");
    } finally {
      if (refresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleRegisterEvent(itemId: string, type: PantryEventType) {
    try {
      await registerPantryItemEvent(itemId, type);
      await loadDashboard(true);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not register item event.");
    }
  }

  return (
    <AppShell title="Dashboard">
      <section className="grid grid-cols-2 gap-3" data-testid="dashboard-summary-cards">
        <SummaryCard
          label="Active items"
          value={summary?.activeItems ?? 0}
          testId="dashboard-active-items"
          loading={isLoading}
        />
        <SummaryCard
          label="Expiring soon"
          value={summary?.expiringSoonItems ?? 0}
          testId="dashboard-expiring-items"
          loading={isLoading}
        />
      </section>

      <section className="mt-5" data-testid="waste-metrics-section">
        <h2 className="px-1 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
          Waste metrics
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="ios-card p-4" data-testid="waste-event-count">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Events</p>
            <p className="mt-2 text-[26px] font-bold leading-none">
              {isLoading ? "…" : (wasteMetrics?.eventCount ?? 0)}
            </p>
          </div>
          <div className="ios-card p-4" data-testid="waste-total-quantity">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Quantity</p>
            <p className="mt-2 text-[26px] font-bold leading-none">
              {isLoading ? "…" : (wasteMetrics?.totalWastedQuantity ?? 0)}
            </p>
          </div>
          <div className="ios-card p-4" data-testid="waste-total-value">
            <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">Value lost</p>
            <p className="mt-2 text-[26px] font-bold leading-none">
              {isLoading ? "…" : `€${Number(wasteMetrics?.totalWastedValueEur ?? "0").toFixed(2)}`}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6" data-testid="dashboard-use-next-section">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="px-1 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Use next
          </h2>
          <button
            type="button"
            className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-medium"
            onClick={() => {
              void loadDashboard(true);
            }}
            disabled={isRefreshing}
            data-testid="dashboard-refresh-button"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-[12px] text-destructive" data-testid="dashboard-error">
            {error}
          </p>
        )}

        {isLoading && (
          <p className="py-8 text-center text-muted-foreground" data-testid="dashboard-loading">
            Loading dashboard...
          </p>
        )}

        {!isLoading && useNext.length === 0 && (
          <p className="py-8 text-center text-muted-foreground" data-testid="dashboard-use-next-empty">
            No active items to prioritize.
          </p>
        )}

        {!isLoading && useNext.length > 0 && (
          <ul className="space-y-2" data-testid="dashboard-use-next-list">
            {useNext.map((item, index) => (
              <li key={item.pantryItemId} className="ios-card p-3" data-testid={`dashboard-use-next-item-${index}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[14px] font-semibold" data-testid={`dashboard-item-name-${item.pantryItemId}`}>
                      {item.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {item.quantity} {item.unit}
                      {item.pricePaid ? ` · €${Number(item.pricePaid).toFixed(2)}` : ""}
                    </p>
                  </div>
                  <RiskBadge risk={item.riskLevel} />
                </div>

                <p className="mt-2 text-[12px] text-muted-foreground" data-testid={`dashboard-item-days-${item.pantryItemId}`}>
                  {formatDays(item.daysUntilExpiration)}
                </p>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-[12px] font-medium text-emerald-700"
                    onClick={() => {
                      void handleRegisterEvent(item.pantryItemId, "CONSUMED");
                    }}
                    data-testid={`dashboard-consume-${item.pantryItemId}`}
                  >
                    Mark consumed
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-destructive/10 px-3 py-1.5 text-[12px] font-medium text-destructive"
                    onClick={() => {
                      void handleRegisterEvent(item.pantryItemId, "WASTED");
                    }}
                    data-testid={`dashboard-waste-${item.pantryItemId}`}
                  >
                    Mark wasted
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function SummaryCard({
  label,
  value,
  testId,
  loading,
}: {
  label: string;
  value: number;
  testId: string;
  loading: boolean;
}) {
  return (
    <div className="ios-card p-4" data-testid={testId}>
      <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className="mt-2 text-[30px] font-bold leading-none">{loading ? "…" : value}</p>
    </div>
  );
}

function RiskBadge({ risk }: { risk: "HIGH" | "MEDIUM" | "LOW" }) {
  const classes =
    risk === "HIGH"
      ? "bg-destructive/10 text-destructive"
      : risk === "MEDIUM"
        ? "bg-warning/20 text-warning-foreground"
        : "bg-secondary text-muted-foreground";

  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${classes}`}>{risk}</span>;
}

function formatDays(days: number | null): string {
  if (days === null) {
    return "No expiration date";
  }
  if (days < 0) {
    return `Expired ${Math.abs(days)} day(s) ago`;
  }
  if (days === 0) {
    return "Expires today";
  }
  return `Expires in ${days} day(s)`;
}
