import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  createRootRoute,
  createRouter,
  RouterProvider,
  createMemoryHistory,
} from "@tanstack/react-router";
import { PointsSummaryWidget } from "@/components/PointsSummaryWidget";
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

// Render the widget inside a minimal router so its <Link> resolves.
function renderWidget(summary: GamificationSummary | null, isLoading = false) {
  const rootRoute = createRootRoute({
    component: () => <PointsSummaryWidget summary={summary} isLoading={isLoading} />,
  });
  const router = createRouter({
    routeTree: rootRoute,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(<RouterProvider router={router as never} />);
}

describe("PointsSummaryWidget", () => {
  it("shows the total points", async () => {
    renderWidget(SUMMARY);
    expect(await screen.findByTestId("points-widget-total")).toHaveTextContent("35");
  });

  it("shows the weekly streak", async () => {
    renderWidget(SUMMARY);
    expect(await screen.findByTestId("points-widget-streak")).toHaveTextContent("2");
  });

  it("shows the most recent badge label", async () => {
    renderWidget(SUMMARY);
    expect(await screen.findByTestId("points-widget-recent-badge")).toHaveTextContent("First Save");
  });

  it("renders a link to the achievements page", async () => {
    renderWidget(SUMMARY);
    const link = await screen.findByTestId("points-widget-link");
    expect(link).toHaveAttribute("href", "/achievements");
  });
});
