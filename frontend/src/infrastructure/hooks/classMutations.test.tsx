// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListClassesResponse, TrainingClass } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";
import { useCancelEnrollment } from "./useCancelEnrollment";
import { useJoinClass } from "./useJoinClass";
import { useJoinWaitingList } from "./useJoinWaitingList";
import { useLeaveWaitingList } from "./useLeaveWaitingList";

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
    visibility: "green",
    coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
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

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function cachedClass(): TrainingClass | undefined {
  return queryClient.getQueryData<ListClassesResponse>(LIST_KEY)?.data.find((c) => c.id === "cl-1");
}

function listQueryIsInvalidated(): boolean {
  return queryClient.getQueryCache().find({ queryKey: LIST_KEY })?.state.isInvalidated === true;
}

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = makeQueryClient();
  mockRepository.join.mockReset();
  mockRepository.cancelEnrollment.mockReset();
  mockRepository.joinWaitingList.mockReset();
  mockRepository.leaveWaitingList.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderHookWithClient<T>(hook: () => T) {
  return renderHook(hook, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe("useJoinClass", () => {
  it("applies the optimistic green->blue update and invalidates classes on success", async () => {
    queryClient.setQueryData(LIST_KEY, listResponse([classRow({ visibility: "green" })]));
    mockRepository.join.mockResolvedValue({
      id: "enr-1",
      classId: "cl-1",
      coacheeId: "c-1",
      joinedAt: "2026-08-20T10:00:00.000Z",
    });
    const { result } = renderHookWithClient(useJoinClass);

    let mutation!: Promise<unknown>;
    act(() => {
      mutation = result.current.mutateAsync("cl-1");
    });
    expect(cachedClass()?.visibility).toBe("blue");

    await act(async () => {
      await mutation;
    });
    expect(mockRepository.join).toHaveBeenCalledWith("cl-1");
    expect(listQueryIsInvalidated()).toBe(true);
  });

  it("rolls back to green when the mutation fails", async () => {
    queryClient.setQueryData(LIST_KEY, listResponse([classRow({ visibility: "green" })]));
    mockRepository.join.mockRejectedValue(new Error("boom"));
    const { result } = renderHookWithClient(useJoinClass);

    let mutation!: Promise<unknown>;
    act(() => {
      mutation = result.current.mutateAsync("cl-1");
    });

    await act(async () => {
      await mutation.catch(() => undefined);
    });
    expect(cachedClass()?.visibility).toBe("green");
  });
});

describe("useCancelEnrollment", () => {
  it("applies the optimistic blue->green update and invalidates classes on success", async () => {
    queryClient.setQueryData(
      LIST_KEY,
      listResponse([
        classRow({
          visibility: "blue",
          coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
        }),
      ]),
    );
    mockRepository.cancelEnrollment.mockResolvedValue({
      message: "canceled",
      waitingListProcessed: false,
      claimedByCoachee: null,
    });
    const { result } = renderHookWithClient(useCancelEnrollment);

    let mutation!: Promise<unknown>;
    act(() => {
      mutation = result.current.mutateAsync("cl-1");
    });
    expect(cachedClass()?.visibility).toBe("green");

    await act(async () => {
      await mutation;
    });
    expect(mockRepository.cancelEnrollment).toHaveBeenCalledWith("cl-1");
    expect(listQueryIsInvalidated()).toBe(true);
  });

  it("rolls back to blue when the mutation fails", async () => {
    queryClient.setQueryData(
      LIST_KEY,
      listResponse([
        classRow({
          visibility: "blue",
          coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
        }),
      ]),
    );
    mockRepository.cancelEnrollment.mockRejectedValue(new Error("boom"));
    const { result } = renderHookWithClient(useCancelEnrollment);

    let mutation!: Promise<unknown>;
    act(() => {
      mutation = result.current.mutateAsync("cl-1");
    });

    await act(async () => {
      await mutation.catch(() => undefined);
    });
    expect(cachedClass()?.visibility).toBe("blue");
  });
});

describe("useJoinWaitingList", () => {
  const gray = () =>
    classRow({
      visibility: "gray",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
    });
  const WAITING_LIST_KEY = ["waiting-lists"];

  it("applies the optimistic on-list update and invalidates waiting lists on success", async () => {
    queryClient.setQueryData(LIST_KEY, listResponse([gray()]));
    queryClient.setQueryData(WAITING_LIST_KEY, { seeded: true });
    mockRepository.joinWaitingList.mockResolvedValue({
      id: "wl-1",
      classId: "cl-1",
      coacheeId: "c-1",
      joinedAt: "2026-08-20T10:00:00.000Z",
    });
    const { result } = renderHookWithClient(useJoinWaitingList);

    let mutation!: Promise<unknown>;
    act(() => {
      mutation = result.current.mutateAsync("cl-1");
    });
    expect(cachedClass()?.coacheeStatus?.isOnWaitingList).toBe(true);

    await act(async () => {
      await mutation;
    });
    expect(mockRepository.joinWaitingList).toHaveBeenCalledWith("cl-1");
    expect(
      queryClient.getQueryCache().find({ queryKey: WAITING_LIST_KEY })?.state.isInvalidated,
    ).toBe(true);
  });
});

describe("useLeaveWaitingList", () => {
  const gray = () =>
    classRow({
      visibility: "gray",
      enrollmentCount: 4,
      capacity: 4,
      coacheeStatus: { isEnrolled: false, isOnWaitingList: true, isWithinReach: true },
    });
  const WAITING_LIST_KEY = ["waiting-lists"];

  it("applies the optimistic off-list update and invalidates waiting lists on success", async () => {
    queryClient.setQueryData(LIST_KEY, listResponse([gray()]));
    queryClient.setQueryData(WAITING_LIST_KEY, { seeded: true });
    mockRepository.leaveWaitingList.mockResolvedValue({ message: "left" });
    const { result } = renderHookWithClient(useLeaveWaitingList);

    let mutation!: Promise<unknown>;
    act(() => {
      mutation = result.current.mutateAsync("cl-1");
    });
    expect(cachedClass()?.coacheeStatus?.isOnWaitingList).toBe(false);

    await act(async () => {
      await mutation;
    });
    expect(mockRepository.leaveWaitingList).toHaveBeenCalledWith("cl-1");
    expect(
      queryClient.getQueryCache().find({ queryKey: WAITING_LIST_KEY })?.state.isInvalidated,
    ).toBe(true);
  });
});
