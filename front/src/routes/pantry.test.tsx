import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: "/pantry" }),
  Link: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <a className={className}>{children}</a>
  ),
}));

vi.mock("@/features/auth/route-guard", () => ({
  requireAuthBeforeLoad: () => undefined,
  useRequireAuthRedirect: () => true,
  consumeHighlightedItem: () => null,
}));

vi.mock("@/features/pantry/pantry-view-state", () => ({
  consumeHighlightedItem: () => null,
  readPantryFilter: () => null,
  readPantrySearch: () => null,
  savePantryFilter: vi.fn(),
  savePantrySearch: vi.fn(),
}));

const listPantryItemsMock = vi.fn();
const reAddConsumptionEventMock = vi.fn();
const listConsumptionEventsMock = vi.fn();
const getExpiredCandidatesMock = vi.fn();
const bulkWasteMock = vi.fn();
const bulkDismissExpiredMock = vi.fn();

vi.mock("@/features/pantry/pantry.api", async () => {
  const actual = await vi.importActual<typeof import("@/features/pantry/pantry.api")>(
    "@/features/pantry/pantry.api",
  );
  return {
    ...actual,
    listPantryItems: (...args: unknown[]) => listPantryItemsMock(...args),
    reAddConsumptionEvent: (...args: unknown[]) => reAddConsumptionEventMock(...args),
    listConsumptionEvents: (...args: unknown[]) => listConsumptionEventsMock(...args),
    getExpiredCandidates: (...args: unknown[]) => getExpiredCandidatesMock(...args),
    bulkWaste: (...args: unknown[]) => bulkWasteMock(...args),
    bulkDismissExpired: (...args: unknown[]) => bulkDismissExpiredMock(...args),
  };
});

import { PantryPage } from "./pantry";
import type { ConsumptionEventRecord } from "@/features/pantry/pantry.api";

function makeEvent(overrides: Partial<ConsumptionEventRecord> = {}): ConsumptionEventRecord {
  return {
    id: "evt-1",
    type: "CONSUMED",
    quantity: 2,
    itemName: "Greek Yogurt",
    itemUnit: "unit",
    itemExpirationDate: null,
    itemPricePaid: null,
    itemNotes: null,
    estimatedValueEur: null,
    occurredAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  listPantryItemsMock.mockResolvedValue([]);
  reAddConsumptionEventMock.mockResolvedValue({ id: "new-item-1", name: "Greek Yogurt" });
  getExpiredCandidatesMock.mockResolvedValue({ items: [], digestId: null });
  bulkWasteMock.mockResolvedValue({ wastedCount: 0, events: [] });
  bulkDismissExpiredMock.mockResolvedValue({ dismissedCount: 0 });
});

describe("PantryPage — handleReAdd", () => {
  async function renderInConsumedTab() {
    render(<PantryPage />);
    const user = userEvent.setup();
    const consumedBtn = await screen.findByRole("button", { name: "Consumed" });
    await user.click(consumedBtn);
    return user;
  }

  it("re-adds by calling the backend with the event id", async () => {
    const event = makeEvent();
    listConsumptionEventsMock.mockResolvedValue([event]);

    const user = await renderInConsumedTab();

    const reAddBtn = await screen.findByTestId(`event-readd-${event.id}`);
    await user.click(reAddBtn);

    await waitFor(() => expect(reAddConsumptionEventMock).toHaveBeenCalledTimes(1));
    expect(reAddConsumptionEventMock).toHaveBeenCalledWith(event.id);
  });

  it("shows success message after re-add", async () => {
    const event = makeEvent();
    listConsumptionEventsMock.mockResolvedValue([event]);

    const user = await renderInConsumedTab();

    const reAddBtn = await screen.findByTestId(`event-readd-${event.id}`);
    await user.click(reAddBtn);

    const msg = await screen.findByTestId("re-add-success");
    expect(msg).toHaveTextContent("Greek Yogurt");
  });

  it("disables all Re-add buttons while a re-add is in flight", async () => {
    let resolveReAdd!: (value: unknown) => void;
    reAddConsumptionEventMock.mockReturnValue(new Promise((resolve) => { resolveReAdd = resolve; }));

    const event = makeEvent();
    listConsumptionEventsMock.mockResolvedValue([event]);

    const user = await renderInConsumedTab();

    const reAddBtn = await screen.findByTestId(`event-readd-${event.id}`);
    await user.click(reAddBtn);

    // Button should be disabled immediately while request is in flight
    await waitFor(() => expect(reAddBtn).toBeDisabled());

    // Resolve to avoid dangling promise
    resolveReAdd({ id: "new-item" });
  });

  it("calls the re-add endpoint exactly once even if the button is triggered twice", async () => {
    const event = makeEvent();
    listConsumptionEventsMock.mockResolvedValue([event]);

    // Slow request so the second click happens before resolution
    let resolveReAdd!: (value: unknown) => void;
    reAddConsumptionEventMock.mockReturnValue(new Promise((resolve) => { resolveReAdd = resolve; }));

    const user = await renderInConsumedTab();
    const reAddBtn = await screen.findByTestId(`event-readd-${event.id}`);

    // Simulate two rapid clicks
    await user.click(reAddBtn);
    await user.click(reAddBtn);

    resolveReAdd({ id: "new-item" });

    await waitFor(() => expect(reAddConsumptionEventMock).toHaveBeenCalledTimes(1));
  });

  it("removes the event row from the list immediately after re-add succeeds", async () => {
    const event = makeEvent();
    listConsumptionEventsMock.mockResolvedValue([event]);

    const user = await renderInConsumedTab();

    await screen.findByTestId(`event-row-${event.id}`);

    await user.click(screen.getByTestId(`event-readd-${event.id}`));

    await waitFor(() =>
      expect(screen.queryByTestId(`event-row-${event.id}`)).not.toBeInTheDocument(),
    );
  });

  it("does not restore the event row when the events list is re-fetched after re-add", async () => {
    const event = makeEvent();
    // First fetch returns the event; second fetch (after switching tabs) returns it again
    // — simulating the API still having it in history.
    listConsumptionEventsMock
      .mockResolvedValueOnce([event])
      .mockResolvedValueOnce([event]);

    const user = await renderInConsumedTab();

    await user.click(await screen.findByTestId(`event-readd-${event.id}`));
    await waitFor(() => expect(reAddConsumptionEventMock).toHaveBeenCalledTimes(1));

    // Simulate the filter effect re-running (switch away and back)
    await user.click(screen.getByRole("button", { name: "All" }));
    await user.click(screen.getByRole("button", { name: "Consumed" }));

    // Even though the API returned the event again, it should not reappear
    await waitFor(() =>
      expect(screen.queryByTestId(`event-row-${event.id}`)).not.toBeInTheDocument(),
    );
  });
});

describe("PantryPage — expired-items banner", () => {
  const candidate = {
    id: "old-1",
    name: "Old Yogurt",
    expirationDate: "2026-06-01",
    daysExpired: 25,
    estimatedValueEur: 4,
  };

  it("does not show the banner when there are no expired candidates", async () => {
    getExpiredCandidatesMock.mockResolvedValue({ items: [], digestId: null });
    render(<PantryPage />);
    await screen.findByPlaceholderText("Search pantry");
    expect(screen.queryByTestId("expired-items-banner")).not.toBeInTheDocument();
  });

  it("shows the banner when expired candidates exist", async () => {
    getExpiredCandidatesMock.mockResolvedValue({ items: [candidate], digestId: null });
    render(<PantryPage />);
    const banner = await screen.findByTestId("expired-items-banner");
    expect(banner).toHaveTextContent("1 items");
  });

  it("hides the banner after marking all as wasted", async () => {
    getExpiredCandidatesMock.mockResolvedValue({ items: [candidate], digestId: null });
    const user = userEvent.setup();
    render(<PantryPage />);

    await user.click(await screen.findByTestId("expired-review-toggle"));
    await user.click(await screen.findByTestId("expired-waste-all"));

    await waitFor(() => expect(bulkWasteMock).toHaveBeenCalledWith(["old-1"]));
    await waitFor(() =>
      expect(screen.queryByTestId("expired-items-banner")).not.toBeInTheDocument(),
    );
  });

  it("dismisses all via the dismiss endpoint", async () => {
    getExpiredCandidatesMock.mockResolvedValue({ items: [candidate], digestId: null });
    const user = userEvent.setup();
    render(<PantryPage />);

    await user.click(await screen.findByTestId("expired-review-toggle"));
    await user.click(await screen.findByTestId("expired-dismiss-all"));

    await waitFor(() => expect(bulkDismissExpiredMock).toHaveBeenCalledWith(["old-1"]));
  });
});
