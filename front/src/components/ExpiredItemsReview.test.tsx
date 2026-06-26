import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ExpiredItemsReview } from "@/components/ExpiredItemsReview";
import type { ExpiredCandidate } from "@/features/pantry/pantry.api";

const CANDIDATES: ExpiredCandidate[] = [
  { id: "a", name: "Old Yogurt", expirationDate: "2026-06-01", daysExpired: 25, estimatedValueEur: 4 },
  { id: "b", name: "Stale Bread", expirationDate: "2026-06-05", daysExpired: 21, estimatedValueEur: null },
];

function setup() {
  const onWasteAll = vi.fn();
  const onDismissAll = vi.fn();
  render(
    <ExpiredItemsReview
      candidates={CANDIDATES}
      onWasteAll={onWasteAll}
      onDismissAll={onDismissAll}
    />,
  );
  return { onWasteAll, onDismissAll };
}

describe("ExpiredItemsReview", () => {
  it("renders each candidate with name and days expired", () => {
    setup();
    expect(screen.getByText("Old Yogurt")).toBeInTheDocument();
    expect(screen.getByText("Stale Bread")).toBeInTheDocument();
    expect(screen.getByTestId("expired-candidate-a")).toHaveTextContent("Expired 25 days ago");
    expect(screen.getByTestId("expired-candidate-a")).toHaveTextContent("€4.00");
  });

  it("calls onWasteAll with all visible ids when marking all as wasted", () => {
    const { onWasteAll } = setup();
    fireEvent.click(screen.getByTestId("expired-waste-all"));
    expect(onWasteAll).toHaveBeenCalledWith(["a", "b"]);
  });

  it("calls onDismissAll with all visible ids when dismissing all", () => {
    const { onDismissAll } = setup();
    fireEvent.click(screen.getByTestId("expired-dismiss-all"));
    expect(onDismissAll).toHaveBeenCalledWith(["a", "b"]);
  });

  it("removes a kept item from the list so bulk actions exclude it", () => {
    const { onWasteAll } = setup();
    fireEvent.click(screen.getByTestId("expired-keep-a"));
    expect(screen.queryByTestId("expired-candidate-a")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("expired-waste-all"));
    expect(onWasteAll).toHaveBeenCalledWith(["b"]);
  });
});
