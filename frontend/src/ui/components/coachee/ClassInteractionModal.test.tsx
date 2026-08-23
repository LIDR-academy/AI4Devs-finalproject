// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListClassesResponse, TrainingClass } from "@/domain/types/class";
import { ToastProvider } from "@/infrastructure/context/ToastContext";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";
import { ToastContainer } from "@/ui/components/Toast";
import { ClassInteractionModal } from "./ClassInteractionModal";

vi.mock("@/infrastructure/repositories/classesRepository", () => ({
  classesRepository: {
    list: vi.fn(),
    get: vi.fn(),
    join: vi.fn(),
    cancelEnrollment: vi.fn(),
    joinWaitingList: vi.fn(),
    leaveWaitingList: vi.fn(),
  },
}));

const mockRepository = vi.mocked(classesRepository);

function classRow(overrides: Partial<TrainingClass> = {}): TrainingClass {
  return {
    id: "cl-1",
    classType: "GROUP",
    assignedCoach: { id: "coach-1", name: "Coach Uno" },
    level: { id: "lv-1", name: "Intermedio", color: "#fff", sortOrder: 3 },
    startTime: "2026-08-22T16:00:00.000Z",
    durationMinutes: 60,
    status: "ACTIVE",
    description: null,
    enrolledCoachees: [],
    enrollmentCount: 2,
    capacity: 4,
    hasWaitingList: true,
    waitingListCount: 0,
    waitingListCoachees: [],
    isRecurring: false,
    recurrenceSeriesId: null,
    visibility: "blue",
    coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
    ...overrides,
  };
}

const LIST_KEY = ["classes", "2026-08-17", "2026-08-23", "all", "all", 1, 100];

function listResponse(classes: TrainingClass[]): ListClassesResponse {
  return {
    data: classes,
    meta: { page: 1, limit: 100, total: classes.length, totalPages: 1 },
  };
}

function setup(queryClient: QueryClient, trainingClass: TrainingClass, onClose = vi.fn()) {
  mockRepository.get.mockResolvedValue(trainingClass);
  mockRepository.list.mockResolvedValue(listResponse([trainingClass]));
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ClassInteractionModal trainingClass={trainingClass} onClose={onClose} />
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return onClose;
}

function setupRegion(
  queryClient: QueryClient,
  trainingClass: TrainingClass,
  { detail }: { detail: TrainingClass },
  onClose = vi.fn(),
) {
  mockRepository.get.mockResolvedValue(detail);
  mockRepository.list.mockResolvedValue(listResponse([trainingClass]));
  render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ClassInteractionModal trainingClass={trainingClass} onClose={onClose} />
        <ToastContainer />
      </ToastProvider>
    </QueryClientProvider>,
  );
  return onClose;
}

describe("ClassInteractionModal cancel flow", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockRepository.cancelEnrollment.mockReset();
    mockRepository.list.mockReset();
    mockRepository.get.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens with the class details (type, time, level, coach) for a blue entry", async () => {
    setup(queryClient, classRow());

    expect(
      await screen.findByRole("heading", { name: "Group class - Intermedio" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Intermedio")).toBeInTheDocument();
    expect(screen.getByText(/Coach Uno/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel enrollment" })).toBeInTheDocument();
  });

  it("shows a confirmation dialog BEFORE the cancel mutation fires", async () => {
    const user = userEvent.setup();
    setup(queryClient, classRow());

    await user.click(await screen.findByRole("button", { name: "Cancel enrollment" }));

    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    expect(within(dialog).getByText("Cancel your enrollment?")).toBeInTheDocument();
    expect(mockRepository.cancelEnrollment).not.toHaveBeenCalled();
  });

  it("dismissing the confirmation fires no mutation and changes nothing", async () => {
    const user = userEvent.setup();
    setup(queryClient, classRow());

    await user.click(await screen.findByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: /Keep class/ }));

    expect(mockRepository.cancelEnrollment).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Cancel enrollment" })).toBeInTheDocument();
  });

  it("confirmed cancel success reflects the optimistic state and shows a success toast", async () => {
    const user = userEvent.setup();
    const onClose = setup(queryClient, classRow());
    queryClient.setQueryData(LIST_KEY, listResponse([classRow({ visibility: "blue" })]));
    mockRepository.cancelEnrollment.mockResolvedValue({
      message: "Enrollment canceled.",
      waitingListProcessed: false,
      claimedByCoachee: null,
    });

    await user.click(await screen.findByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel enrollment" }));

    expect(mockRepository.cancelEnrollment).toHaveBeenCalledWith("cl-1");
    expect(await screen.findByText("You left the class.")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });

  it("confirmed cancel failure rolls back the cache and shows the mapped error toast", async () => {
    const user = userEvent.setup();
    setup(queryClient, classRow());
    queryClient.setQueryData(LIST_KEY, listResponse([classRow({ visibility: "blue" })]));
    mockRepository.cancelEnrollment.mockRejectedValue({
      response: { data: { error: { code: "FORBIDDEN", message: "No", ref: "r" } } },
    });

    await user.click(await screen.findByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel enrollment" }));

    expect(await screen.findByText("You don't have permission to do that.")).toBeInTheDocument();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.visibility).toBe("blue");
  });

  it("shows Cancel enrollment, NOT Join waiting list, when the detail omits visibility for an enrolled full class", async () => {
    const user = userEvent.setup();
    const enrolledFull = classRow({
      visibility: "blue",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
    });
    const onClose = setupRegion(queryClient, enrolledFull, {
      detail: { ...enrolledFull, visibility: undefined },
    });

    expect(await screen.findByRole("button", { name: "Cancel enrollment" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Join waiting list" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Leave waiting list" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel enrollment" }));
    const dialog = screen.getByRole("dialog", { name: "Cancel your enrollment?" });
    await user.click(within(dialog).getByRole("button", { name: "Cancel enrollment" }));
    expect(mockRepository.cancelEnrollment).toHaveBeenCalledWith("cl-1");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ClassInteractionModal join flow", () => {
  let queryClient: QueryClient;

  const greenClass = () =>
    classRow({
      visibility: "green",
      coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
    });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockRepository.join.mockReset();
    mockRepository.list.mockReset();
    mockRepository.get.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens on a green card showing level, coach, and spots available", async () => {
    setup(queryClient, greenClass());

    expect(
      await screen.findByRole("heading", { name: "Group class - Intermedio" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Intermedio")).toBeInTheDocument();
    expect(screen.getByText(/Coach Uno/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument();
  });

  it("shows a confirmation dialog BEFORE the join mutation fires", async () => {
    const user = userEvent.setup();
    setup(queryClient, greenClass());

    await user.click(await screen.findByRole("button", { name: "Join" }));

    const dialog = screen.getByRole("dialog", { name: "Join this class?" });
    expect(within(dialog).getByText("Join this class?")).toBeInTheDocument();
    expect(mockRepository.join).not.toHaveBeenCalled();
  });

  it("dismissing the confirmation fires no mutation", async () => {
    const user = userEvent.setup();
    setup(queryClient, greenClass());

    await user.click(await screen.findByRole("button", { name: "Join" }));
    const dialog = screen.getByRole("dialog", { name: "Join this class?" });
    await user.click(within(dialog).getByRole("button", { name: /Keep class/ }));

    expect(mockRepository.join).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Join" })).toBeInTheDocument();
  });

  it("confirmed join success reflects the optimistic blue state and shows a success toast", async () => {
    const user = userEvent.setup();
    const onClose = setup(queryClient, greenClass());
    queryClient.setQueryData(LIST_KEY, listResponse([greenClass()]));
    mockRepository.join.mockResolvedValue({
      id: "enr-1",
      classId: "cl-1",
      coacheeId: "coachee-1",
      joinedAt: "2026-08-20T10:00:00.000Z",
    });

    await user.click(await screen.findByRole("button", { name: "Join" }));
    const dialog = screen.getByRole("dialog", { name: "Join this class?" });
    await user.click(within(dialog).getByRole("button", { name: "Join class" }));

    expect(mockRepository.join).toHaveBeenCalledWith("cl-1");
    expect(await screen.findByText("You joined the class.")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.visibility).toBe("blue");
  });

  it("confirmed join failure on CLASS_FULL rolls back to green and toasts the mapped error", async () => {
    const user = userEvent.setup();
    setup(queryClient, greenClass());
    queryClient.setQueryData(LIST_KEY, listResponse([greenClass()]));
    mockRepository.join.mockRejectedValue({
      response: { data: { error: { code: "CLASS_FULL", message: "Full", ref: "r" } } },
    });

    await user.click(await screen.findByRole("button", { name: "Join" }));
    const dialog = screen.getByRole("dialog", { name: "Join this class?" });
    await user.click(within(dialog).getByRole("button", { name: "Join class" }));

    expect(await screen.findByText("Class is full.")).toBeInTheDocument();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.visibility).toBe("green");
  });
});

describe("ClassInteractionModal waitlist flow", () => {
  let queryClient: QueryClient;

  const eligibleGray = () =>
    classRow({
      visibility: "gray",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
    });
  const onListGray = () =>
    classRow({
      visibility: "gray",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: false, isOnWaitingList: true, isWithinReach: true },
    });
  const ineligibleGray = () =>
    classRow({
      visibility: "gray",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: false },
    });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockRepository.joinWaitingList.mockReset();
    mockRepository.leaveWaitingList.mockReset();
    mockRepository.list.mockReset();
    mockRepository.get.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens on an eligible gray card showing time, type, level, coach, and join-waiting-list", async () => {
    setup(queryClient, eligibleGray());

    expect(await screen.findByRole("heading", { name: "Busy" })).toBeInTheDocument();
    expect(screen.getByText("Group")).toBeInTheDocument();
    expect(screen.getByText("Intermedio")).toBeInTheDocument();
    expect(screen.getByText(/Coach Uno/)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Join waiting list" })).toBeInTheDocument();
  });

  it("shows Leave waiting list instead of join when already on the list", async () => {
    setup(queryClient, onListGray());

    expect(await screen.findByRole("button", { name: "Leave waiting list" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Join waiting list" })).not.toBeInTheDocument();
  });

  it("shows a confirmation dialog BEFORE the waitlist-join mutation fires", async () => {
    const user = userEvent.setup();
    setup(queryClient, eligibleGray());

    await user.click(await screen.findByRole("button", { name: "Join waiting list" }));

    const dialog = screen.getByRole("dialog", { name: "Join the waiting list?" });
    expect(within(dialog).getByText("Join the waiting list?")).toBeInTheDocument();
    expect(mockRepository.joinWaitingList).not.toHaveBeenCalled();
  });

  it("confirmed waitlist-join success reflects the optimistic on-list state and toasts", async () => {
    const user = userEvent.setup();
    const onClose = setup(queryClient, eligibleGray());
    queryClient.setQueryData(LIST_KEY, listResponse([eligibleGray()]));
    mockRepository.joinWaitingList.mockResolvedValue({
      id: "wl-1",
      classId: "cl-1",
      coacheeId: "coachee-1",
      joinedAt: "2026-08-20T10:00:00.000Z",
    });

    await user.click(await screen.findByRole("button", { name: "Join waiting list" }));
    const dialog = screen.getByRole("dialog", { name: "Join the waiting list?" });
    await user.click(within(dialog).getByRole("button", { name: "Join waiting list" }));

    expect(mockRepository.joinWaitingList).toHaveBeenCalledWith("cl-1");
    expect(await screen.findByText("You joined the waiting list.")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.coacheeStatus?.isOnWaitingList).toBe(true);
  });

  it("confirmed waitlist-join failure rolls back and toasts the mapped error", async () => {
    const user = userEvent.setup();
    setup(queryClient, eligibleGray());
    queryClient.setQueryData(LIST_KEY, listResponse([eligibleGray()]));
    mockRepository.joinWaitingList.mockRejectedValue({
      response: { data: { error: { code: "WAITING_LIST_FULL", message: "Full", ref: "r" } } },
    });

    await user.click(await screen.findByRole("button", { name: "Join waiting list" }));
    const dialog = screen.getByRole("dialog", { name: "Join the waiting list?" });
    await user.click(within(dialog).getByRole("button", { name: "Join waiting list" }));

    expect(await screen.findByText("The waiting list for this class is full.")).toBeInTheDocument();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.coacheeStatus?.isOnWaitingList).toBe(false);
  });

  it("confirmed waitlist-leave success reflects the optimistic off-list state and toasts", async () => {
    const user = userEvent.setup();
    const onClose = setup(queryClient, onListGray());
    queryClient.setQueryData(LIST_KEY, listResponse([onListGray()]));
    mockRepository.leaveWaitingList.mockResolvedValue({
      message: "Removed from waiting list.",
    });

    await user.click(await screen.findByRole("button", { name: "Leave waiting list" }));
    const dialog = screen.getByRole("dialog", { name: "Leave the waiting list?" });
    await user.click(within(dialog).getByRole("button", { name: "Leave waiting list" }));

    expect(mockRepository.leaveWaitingList).toHaveBeenCalledWith("cl-1");
    expect(await screen.findByText("You left the waiting list.")).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.coacheeStatus?.isOnWaitingList).toBe(false);
  });

  it("opens on an ineligible gray card as info-only with 'not open to you'", async () => {
    setup(queryClient, ineligibleGray());

    expect(await screen.findByText("This time slot is not open to you.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Join waiting list" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Leave waiting list" })).not.toBeInTheDocument();
  });

  it("opens on a canceled card as info-only", async () => {
    setup(queryClient, classRow({ status: "CANCELED" }));

    expect(await screen.findByText("This class has been canceled.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Join waiting list" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel enrollment" })).not.toBeInTheDocument();
  });
});

describe("ClassInteractionModal cross-cutting guarantees", () => {
  let queryClient: QueryClient;

  const greenClass = () =>
    classRow({
      visibility: "green",
      coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
    });
  const onListGray = () =>
    classRow({
      visibility: "gray",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: false, isOnWaitingList: true, isWithinReach: true },
    });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockRepository.join.mockReset();
    mockRepository.leaveWaitingList.mockReset();
    mockRepository.list.mockReset();
    mockRepository.get.mockReset();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a confirmation dialog BEFORE the waitlist-leave mutation fires", async () => {
    const user = userEvent.setup();
    setup(queryClient, onListGray());

    await user.click(await screen.findByRole("button", { name: "Leave waiting list" }));

    const dialog = screen.getByRole("dialog", { name: "Leave the waiting list?" });
    expect(within(dialog).getByText("Leave the waiting list?")).toBeInTheDocument();
    expect(mockRepository.leaveWaitingList).not.toHaveBeenCalled();
  });

  it("locks the modal while a mutation is pending and ignores a second action", async () => {
    const user = userEvent.setup();
    setup(queryClient, greenClass());
    mockRepository.join.mockImplementation(() => new Promise(() => {}));

    await user.click(await screen.findByRole("button", { name: "Join" }));
    const dialog = screen.getByRole("dialog", { name: "Join this class?" });
    await user.click(within(dialog).getByRole("button", { name: "Join class" }));

    expect(within(dialog).getByRole("button", { name: "Working..." })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: /Keep class/ })).toBeDisabled();
    const detailsDialog = screen.getByRole("dialog", { name: "Group class - Intermedio" });
    const actionButton = within(detailsDialog)
      .getAllByRole("button")
      .find((b) => b.className.includes("bg-blue-600"));
    expect(actionButton).toBeDefined();
    expect(actionButton).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close details" })).toBeDisabled();
    expect(mockRepository.join).toHaveBeenCalledTimes(1);
  });

  it("dismissing the waitlist-leave confirmation fires no mutation", async () => {
    const user = userEvent.setup();
    setup(queryClient, onListGray());

    await user.click(await screen.findByRole("button", { name: "Leave waiting list" }));
    const dialog = screen.getByRole("dialog", { name: "Leave the waiting list?" });
    await user.click(within(dialog).getByRole("button", { name: /Keep my place/ }));

    expect(mockRepository.leaveWaitingList).not.toHaveBeenCalled();
  });

  it("a network failure restores the exact pre-action state and shows the fallback toast", async () => {
    const user = userEvent.setup();
    setup(queryClient, greenClass());
    const before = listResponse([greenClass()]);
    queryClient.setQueryData(LIST_KEY, before);
    mockRepository.join.mockRejectedValue(new Error("Network down"));

    await user.click(await screen.findByRole("button", { name: "Join" }));
    const dialog = screen.getByRole("dialog", { name: "Join this class?" });
    await user.click(within(dialog).getByRole("button", { name: "Join class" }));

    expect(await screen.findByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(queryClient.getQueryData<ListClassesResponse>(LIST_KEY)).toEqual(before);
  });

  it("a failed waitlist-leave rolls back the optimistic on-list state", async () => {
    const user = userEvent.setup();
    setup(queryClient, onListGray());
    queryClient.setQueryData(LIST_KEY, listResponse([onListGray()]));
    mockRepository.leaveWaitingList.mockRejectedValue({
      response: { data: { error: { code: "LEVEL_MISMATCH", message: "No", ref: "r" } } },
    });

    await user.click(await screen.findByRole("button", { name: "Leave waiting list" }));
    const dialog = screen.getByRole("dialog", { name: "Leave the waiting list?" });
    await user.click(within(dialog).getByRole("button", { name: "Leave waiting list" }));

    expect(
      await screen.findByText("Level mismatch — this class requires a different level."),
    ).toBeInTheDocument();
    const cached = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(cached?.data.find((c) => c.id === "cl-1")?.coacheeStatus?.isOnWaitingList).toBe(true);
  });
});
