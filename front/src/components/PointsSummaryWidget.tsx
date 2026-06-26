import { Link } from "@tanstack/react-router";
import { Award, ChevronRight, Flame } from "lucide-react";
import type { GamificationSummary } from "@/features/gamification/gamification.api";

interface PointsSummaryWidgetProps {
  summary: GamificationSummary | null;
  isLoading: boolean;
}

export function PointsSummaryWidget({ summary, isLoading }: PointsSummaryWidgetProps) {
  const mostRecentBadge = summary?.badges[0] ?? null;

  return (
    <Link to="/achievements" className="ios-card block p-4" data-testid="points-widget-link">
      <div className="flex items-center justify-between">
        <p className="text-[12px] uppercase tracking-wider text-muted-foreground font-semibold">
          Achievements
        </p>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-[30px] font-bold leading-none" data-testid="points-widget-total">
            {isLoading ? "…" : (summary?.totalPoints ?? 0)}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">points</p>
        </div>

        <div
          className="flex items-center gap-1 text-[13px] text-muted-foreground"
          data-testid="points-widget-streak"
        >
          <Flame className="h-4 w-4" />
          <span>{isLoading ? "…" : (summary?.weeklyStreak ?? 0)}</span>
          <span>week streak</span>
        </div>
      </div>

      <div
        className="mt-3 flex items-center gap-2 text-[13px]"
        data-testid="points-widget-recent-badge"
      >
        <Award className="h-4 w-4 text-muted-foreground" />
        {mostRecentBadge ? (
          <span className="font-medium">{mostRecentBadge.label}</span>
        ) : (
          <span className="text-muted-foreground">No badges yet</span>
        )}
      </div>
    </Link>
  );
}
