// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CoacheeNextClass } from "@/domain/types/coachee";
import { ToastProvider } from "@/infrastructure/context/ToastContext";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";
import { ToastContainer } from "@/ui/components/Toast";
import { NextClassCard } from "./NextClassCard";

vi.mock("@/infrastructure/repositories/classesRepository", () => ({
  classesRepository: {
    list: vi.fn(),
    get: vi.fn(),
    join: vi.fn(),
    cancelEnrollment: vi.fn(),
    joinWaitingList: vi.fn(),
    leaveWaitingList: vi.fn(),
    claimWaitingListSpot: vi.fn(),
  },
}));

const mockRepository = vi.mocked(classesRepository);

function nextClass(overrides: Partial<CoacheeNextClass> = {}): CoacheeNextClass {
  return {
    id: "cl-1",
    classType: "INDIVIDUAL",
    startTime: "2026-08-22T16:00:00.000Z",
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: { id: "lv-1", name: "Intermedio", color: "#ffffff" },
    status: "ACTIVE",
    ...overrides,
  };
}

function setup(queryClient: QueryClient, value: CoacheeNextClass | null) {
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <NextClassCard nextClass={value} />
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("NextClassCard cancel enrollment flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockRepository.cancelEnrollment.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows the EmptyState when there is no next class", () => {
    setup(queryClient, null);

    expect(screen.getByText("No upcoming classes")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel enrollment" })).not.toBeInTheDocument();
  });

  it("shows class details and a cancel enrollment button", () => {
    setup(queryClient, nextClass());

    expect(screen.getByText("Next Class")).toBeInTheDocument();
    expect(screen.getByText("Individual")).toBeInTheDocument();
    expect(screen.getByText("Coach Uno")).toBeInTheDocument();
    expect(screen.getByText("Intermedio")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel enrollment" })).toBeInTheDocument();
  });

  it("shows a confirmation dialog BEFORE the cancel mutation fires", async () => {
    const user = userEvent.setup();
    setup(queryClient, nextClass());

    await user.click(screen.getByRole("button", { name: "Cancel enrollment" }));

    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    expect(within(dialog).getByText("Cancel your enrollment?")).toBeInTheDocument();
    expect(mockRepository.cancelEnrollment).not.toHaveBeenCalled();
  });

  it("dismissing the confirmation fires no mutation", async () => {
    const user = userEvent.setup();
    setup(queryClient, nextClass());

    await user.click(screen.getByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: /Keep class/ }));

    expect(mockRepository.cancelEnrollment).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cancel enrollment" })).toBeInTheDocument();
  });

  it("confirmed cancel success calls the API and shows a success toast", async () => {
    const user = userEvent.setup();
    setup(queryClient, nextClass());
    mockRepository.cancelEnrollment.mockResolvedValue({
      message: "Enrollment canceled.",
      waitingListProcessed: false,
      claimedByCoachee: null,
    });

    await user.click(screen.getByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel enrollment" }));

    expect(mockRepository.cancelEnrollment).toHaveBeenCalledWith("cl-1");
    expect(await screen.findByText("You left the class.")).toBeInTheDocument();
    expect(
      screen.queryByRole("dialog", { name: "Cancel your enrollment?" }),
    ).not.toBeInTheDocument();
  });

  it("confirmed cancel failure shows the mapped error toast", async () => {
    const user = userEvent.setup();
    setup(queryClient, nextClass());
    mockRepository.cancelEnrollment.mockRejectedValue({
      response: { data: { error: { code: "FORBIDDEN", message: "No", ref: "r" } } },
    });

    await user.click(screen.getByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel enrollment" }));

    expect(await screen.findByText("You don't have permission to do that.")).toBeInTheDocument();
    expect(mockRepository.cancelEnrollment).toHaveBeenCalledWith("cl-1");
  });
});
