import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/achievements" }),
  Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
}));

vi.mock("@/features/auth/route-guard", () => ({
  requireAuthBeforeLoad: () => undefined,
  useRequireAuthRedirect: () => true,
}));

const getGamificationSummaryMock = vi.fn();
const getPointsHistoryMock = vi.fn();

vi.mock("@/features/gamification/gamification.api", async () => {
  const actual = await vi.importActual<typeof import("@/features/gamification/gamification.api")>(
    "@/features/gamification/gamification.api",
  );
  return {
    ...actual,
    getGamificationSummary: (...args: unknown[]) => getGamificationSummaryMock(...args),
    getPointsHistory: (...args: unknown[]) => getPointsHistoryMock(...args),
  };
});

import { AchievementsPage } from "./achievements";
import type { GamificationSummary } from "@/features/gamification/gamification.api";

const SUMMARY: GamificationSummary = {
  totalPoints: 35,
  totalValueSavedEur: 12.5,
  totalValueWastedEur: 3,
  consumedBeforeExpiryCount: 3,
  wastedCount: 1,
  badges: [
    {
      id: "b1",
      code: "FIRST_SAVE",
      earnedAt: "2026-06-26T10:00:00.000Z",
      label: "First Save",
      description: "You consumed your first item before it expired.",
    },
  ],
  weeklyStreak: 2,
};

describe("AchievementsPage", () => {
  it("shows the total points", async () => {
    getGamificationSummaryMock.mockResolvedValue(SUMMARY);
    getPointsHistoryMock.mockResolvedValue({ events: [], total: 0 });

    render(<AchievementsPage />);

    expect(await screen.findByTestId("achievements-total-points")).toHaveTextContent("35");
  });

  it("renders an earned badge in the earned state", async () => {
    getGamificationSummaryMock.mockResolvedValue(SUMMARY);
    getPointsHistoryMock.mockResolvedValue({ events: [], total: 0 });

    render(<AchievementsPage />);

    const firstSave = await screen.findByTestId("achievement-badge-FIRST_SAVE");
    expect(firstSave).toHaveAttribute("data-earned", "true");
    expect(firstSave).toHaveTextContent("First Save");
  });

  it("renders a locked badge with its unlock condition", async () => {
    getGamificationSummaryMock.mockResolvedValue(SUMMARY);
    getPointsHistoryMock.mockResolvedValue({ events: [], total: 0 });

    render(<AchievementsPage />);

    const locked = await screen.findByTestId("achievement-badge-SAVER_10");
    await waitFor(() => expect(locked).toHaveAttribute("data-earned", "false"));
    expect(locked).toHaveTextContent(/consume 10 items before expiry/i);
  });

  it("renders the points history entries", async () => {
    getGamificationSummaryMock.mockResolvedValue(SUMMARY);
    getPointsHistoryMock.mockResolvedValue({
      events: [
        {
          id: "p1",
          type: "POINTS_EARNED",
          points: 10,
          badgeCode: null,
          reason: "Consumed before expiry",
          occurredAt: "2026-06-20T10:00:00.000Z",
        },
      ],
      total: 1,
    });

    render(<AchievementsPage />);

    const list = await screen.findByTestId("history-list");
    expect(list).toHaveTextContent("Consumed before expiry");
    expect(list).toHaveTextContent("+10");
  });

  it("requests the next page of history when Next is clicked", async () => {
    getGamificationSummaryMock.mockResolvedValue(SUMMARY);
    getPointsHistoryMock.mockResolvedValue({
      events: Array.from({ length: 20 }, (_, i) => ({
        id: `p${i}`,
        type: "POINTS_EARNED" as const,
        points: 10,
        badgeCode: null,
        reason: "Consumed before expiry",
        occurredAt: "2026-06-20T10:00:00.000Z",
      })),
      total: 25,
    });

    render(<AchievementsPage />);

    const next = await screen.findByTestId("history-next");
    next.click();

    await waitFor(() => expect(getPointsHistoryMock).toHaveBeenCalledWith(20, 20));
  });
});
