import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BADGE_CATALOG } from "@/features/gamification/badge-catalog";
import {
  getGamificationSummary,
  getPointsHistory,
  type GamificationSummary,
  type PointsHistoryPage,
} from "@/features/gamification/gamification.api";
import { requireAuthBeforeLoad, useRequireAuthRedirect } from "@/features/auth/route-guard";

export const Route = createFileRoute("/achievements")({
  beforeLoad: requireAuthBeforeLoad,
  component: AchievementsPage,
});

const HISTORY_PAGE_SIZE = 20;

export function AchievementsPage() {
  const authed = useRequireAuthRedirect();

  const [summary, setSummary] = useState<GamificationSummary | null>(null);
  const [history, setHistory] = useState<PointsHistoryPage | null>(null);
  const [historyOffset, setHistoryOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summaryData = await getGamificationSummary();
      setSummary(summaryData);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not load achievements.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (offset: number) => {
    try {
      const page = await getPointsHistory(HISTORY_PAGE_SIZE, offset);
      setHistory(page);
    } catch (apiError) {
      setError(apiError instanceof Error ? apiError.message : "Could not load history.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadHistory(historyOffset);
  }, [loadHistory, historyOffset]);

  if (!authed) {
    return null;
  }

  const earnedByCode = new Map((summary?.badges ?? []).map((badge) => [badge.code, badge]));

  return (
    <AppShell title="Achievements">
      <section className="grid grid-cols-2 gap-3" data-testid="achievements-totals">
        <div className="ios-card p-4">
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Total points
          </p>
          <p
            className="mt-2 text-[30px] font-bold leading-none"
            data-testid="achievements-total-points"
          >
            {isLoading ? "…" : (summary?.totalPoints ?? 0)}
          </p>
        </div>
        <div className="ios-card p-4">
          <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
            Value saved
          </p>
          <p
            className="mt-2 text-[30px] font-bold leading-none"
            data-testid="achievements-value-saved"
          >
            {isLoading ? "…" : `€${Number(summary?.totalValueSavedEur ?? 0).toFixed(2)}`}
          </p>
        </div>
      </section>

      {error && (
        <p className="mt-4 text-[13px] text-destructive" data-testid="achievements-error">
          {error}
        </p>
      )}

      <section className="mt-6" data-testid="achievements-badges">
        <h2 className="px-1 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
          Badges
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {BADGE_CATALOG.map((badge) => {
            const earned = earnedByCode.get(badge.code);
            const isEarned = Boolean(earned);
            return (
              <div
                key={badge.code}
                className={
                  isEarned
                    ? "ios-card p-4 space-y-1"
                    : "ios-card p-4 space-y-1 opacity-60 grayscale"
                }
                data-testid={`achievement-badge-${badge.code}`}
                data-earned={isEarned ? "true" : "false"}
              >
                <div className="flex items-center gap-2">
                  {isEarned ? (
                    <Award className="h-5 w-5 text-primary" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <p className="text-[14px] font-semibold">{badge.label}</p>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  {isEarned ? badge.description : badge.unlockCondition}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6" data-testid="history-section">
        <h2 className="px-1 mb-2 text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
          Points history
        </h2>
        <div className="ios-card divide-y divide-border/60" data-testid="history-list">
          {history && history.events.length > 0 ? (
            history.events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between px-4 py-3"
                data-testid="history-entry"
              >
                <div>
                  <p className="text-[14px]">{event.reason}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(event.occurredAt).toLocaleDateString("en-GB")}
                  </p>
                </div>
                {event.type === "BADGE_EARNED" ? (
                  <span className="text-[13px] font-semibold text-primary">Badge</span>
                ) : (
                  <span
                    className={
                      (event.points ?? 0) >= 0
                        ? "text-[15px] font-semibold text-emerald-600"
                        : "text-[15px] font-semibold text-destructive"
                    }
                  >
                    {(event.points ?? 0) >= 0 ? `+${event.points ?? 0}` : event.points}
                  </span>
                )}
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-[13px] text-muted-foreground">No history yet.</p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-medium disabled:opacity-40"
            onClick={() => setHistoryOffset((offset) => Math.max(0, offset - HISTORY_PAGE_SIZE))}
            disabled={historyOffset === 0}
            data-testid="history-prev"
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-lg bg-secondary px-3 py-1.5 text-[12px] font-medium disabled:opacity-40"
            onClick={() => setHistoryOffset((offset) => offset + HISTORY_PAGE_SIZE)}
            disabled={!history || historyOffset + HISTORY_PAGE_SIZE >= history.total}
            data-testid="history-next"
          >
            Next
          </button>
        </div>
      </section>
    </AppShell>
  );
}
