import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { getBadgeDefinition } from "./badge-catalog";
import { isConsumedBeforeExpiry } from "./scoring";
import { computeWeeklyStreak } from "./week";

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

function round2(value: number): number {
  return Number(value.toFixed(2));
}

const POINTS_REASON_TEXT: Record<string, string> = {
  CONSUMED_BEFORE_EXPIRY: "Consumed before expiry",
  BONUS_3_DAYS: "Bonus: consumed with 3+ days to spare",
  WASTED: "Item wasted",
};

function pointsReasonText(reason: string): string {
  return POINTS_REASON_TEXT[reason] ?? reason;
}

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string): Promise<GamificationSummary> {
    const [pointsAgg, events, badges] = await Promise.all([
      this.prisma.userPoints.aggregate({ where: { userId }, _sum: { delta: true } }),
      this.prisma.consumptionEvent.findMany({
        where: { userId },
        select: { type: true, itemExpirationDate: true, occurredAt: true, estimatedValueEur: true },
      }),
      this.prisma.userBadge.findMany({ where: { userId }, orderBy: { earnedAt: "desc" } }),
    ]);

    const rawTotal = pointsAgg._sum.delta ?? 0;
    const totalPoints = Math.max(0, rawTotal);

    const beforeExpiry = events.filter(
      (e) => e.type === "CONSUMED" && isConsumedBeforeExpiry(e.occurredAt, e.itemExpirationDate),
    );
    const wasted = events.filter((e) => e.type === "WASTED");

    const sumValue = (rows: { estimatedValueEur: { toString(): string } | null }[]): number =>
      rows.reduce((acc, row) => acc + (row.estimatedValueEur ? Number(row.estimatedValueEur) : 0), 0);

    const weeklyStreak = computeWeeklyStreak(
      events.map((e) => ({ type: e.type, occurredAt: e.occurredAt })),
      new Date(),
    );

    const summaryBadges: SummaryBadge[] = badges.map((badge) => {
      const def = getBadgeDefinition(badge.code);
      return {
        id: badge.id,
        code: badge.code,
        earnedAt: badge.earnedAt.toISOString(),
        label: def?.label ?? badge.code,
        description: def?.description ?? "",
      };
    });

    return {
      totalPoints,
      totalValueSavedEur: round2(sumValue(beforeExpiry)),
      totalValueWastedEur: round2(sumValue(wasted)),
      consumedBeforeExpiryCount: beforeExpiry.length,
      wastedCount: wasted.length,
      badges: summaryBadges,
      weeklyStreak,
    };
  }

  async getHistory(userId: string, limit: number, offset: number): Promise<PointsHistoryPage> {
    const [points, badges] = await Promise.all([
      this.prisma.userPoints.findMany({ where: { userId }, orderBy: { occurredAt: "desc" } }),
      this.prisma.userBadge.findMany({ where: { userId }, orderBy: { earnedAt: "desc" } }),
    ]);

    const entries: Array<HistoryEvent & { sortKey: number }> = [
      ...points.map((p) => ({
        id: p.id,
        type: (p.delta >= 0 ? "POINTS_EARNED" : "POINTS_DEDUCTED") as HistoryEventType,
        points: p.delta,
        badgeCode: null,
        reason: pointsReasonText(p.reason),
        occurredAt: p.occurredAt.toISOString(),
        sortKey: p.occurredAt.getTime(),
      })),
      ...badges.map((b) => {
        const def = getBadgeDefinition(b.code);
        return {
          id: b.id,
          type: "BADGE_EARNED" as HistoryEventType,
          points: null,
          badgeCode: b.code,
          reason: `Earned the ${def?.label ?? b.code} badge`,
          occurredAt: b.earnedAt.toISOString(),
          sortKey: b.earnedAt.getTime(),
        };
      }),
    ];

    entries.sort((a, b) => b.sortKey - a.sortKey);

    const events = entries
      .slice(offset, offset + limit)
      .map(({ sortKey: _sortKey, ...event }) => event);

    return { events, total: entries.length };
  }
}
