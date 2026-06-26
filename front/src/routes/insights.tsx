import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PointsSummaryWidget } from "@/components/PointsSummaryWidget";
import {
  getDashboardSummary,
  type DashboardSummaryResponse,
} from "@/features/dashboard/dashboard.api";
import {
  getGamificationSummary,
  type GamificationSummary,
} from "@/features/gamification/gamification.api";
import {
  getWasteMetrics,
  type WasteMetricsResponse,
} from "@/features/insights/insights.api";
import {
  getUseNextItems,
  registerPantryItemEvent,
  type PantryEventType,
  type UseNextItem,
} from "@/features/pantry/pantry.api";
import { UseNextList } from "@/features/pantry/UseNextList";
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
  const [useNext, setUseNext] = useState<UseNextItem[]>([]);
  const [wasteMetrics, setWasteMetrics] = useState<WasteMetricsResponse | null>(null);
  const [gamification, setGamification] = useState<GamificationSummary | null>(null);
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
      const [summaryData, useNextData, wasteData, gamificationData] = await Promise.all([
        getDashboardSummary(),
        getUseNextItems(),
        getWasteMetrics(),
        getGamificationSummary(),
      ]);
      setSummary(summaryData);
      setUseNext(useNextData.items);
      setWasteMetrics(wasteData);
      setGamification(gamificationData);
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

      <section className="mt-5" data-testid="points-summary-section">
        <PointsSummaryWidget summary={gamification} isLoading={isLoading} />
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

        <UseNextList
          items={useNext}
          isLoading={isLoading}
          error={error}
          onConsume={(id) => handleRegisterEvent(id, "CONSUMED")}
          onWaste={(id) => handleRegisterEvent(id, "WASTED")}
          emptyMessage="No active items to prioritize."
          loadingMessage="Loading dashboard..."
          testIdPrefix="dashboard-use-next"
        />
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

