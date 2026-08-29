import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { ListClassesResponse, TrainingClass } from "@/domain/types/class";
import { buildOptimisticClassMutation, type OptimisticSnapshot } from "./optimisticClassMutation";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function classRow(id: string, overrides: Partial<TrainingClass> = {}): TrainingClass {
  return {
    id,
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
    waitingListCount: 1,
    waitingListCoachees: [{ id: "wl-1", name: "Paco" }],
    isRecurring: false,
    recurrenceSeriesId: null,
    visibility: "green",
    coacheeStatus: { isEnrolled: false, isOnWaitingList: false, isWithinReach: true },
    ...overrides,
  };
}

const LIST_KEY = ["classes", "2026-08-17", "2026-08-23", "all", "all", 1, 100];
const OTHER_LIST_KEY = ["classes", "2026-08-24", "2026-08-30", "all", "all", 1, 100];
const DETAIL_KEY = ["classes", "cl-1"];

function listResponse(classes: TrainingClass[]): ListClassesResponse {
  return {
    data: classes,
    meta: { page: 1, limit: 100, total: classes.length, totalPages: 1 },
  };
}

describe("buildOptimisticClassMutation", () => {
  it("join flips the matching class in a list cache to blue", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(LIST_KEY, listResponse([classRow("cl-1"), classRow("cl-2")]));
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "join" });

    await onMutate("cl-1");

    const value = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    const cl1 = value?.data.find((c) => c.id === "cl-1");
    const cl2 = value?.data.find((c) => c.id === "cl-2");
    expect(cl1?.visibility).toBe("blue");
    expect(cl1?.coacheeStatus?.isEnrolled).toBe(true);
    expect(cl1?.enrollmentCount).toBe(3);
    expect(cl2?.visibility).toBe("green");
  });

  it("cancel flips the matching class in a detail cache to gray for individual", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(
      DETAIL_KEY,
      classRow("cl-1", {
        classType: "INDIVIDUAL",
        visibility: "blue",
        coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
      }),
    );
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "cancel" });

    await onMutate("cl-1");

    const value = queryClient.getQueryData<TrainingClass>(DETAIL_KEY);
    expect(value?.visibility).toBe("gray");
    expect(value?.coacheeStatus?.isEnrolled).toBe(false);
    expect(value?.enrollmentCount).toBe(1);
  });

  it("waitlist-join marks the matching class on the list in a list cache", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(
      LIST_KEY,
      listResponse([classRow("cl-1", { visibility: "gray", waitingListCount: 1 })]),
    );
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "waitlist-join" });

    await onMutate("cl-1");

    const value = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    const cl1 = value?.data.find((c) => c.id === "cl-1");
    expect(cl1?.coacheeStatus?.isOnWaitingList).toBe(true);
    expect(cl1?.waitingListCount).toBe(2);
  });

  it("waitlist-leave clears the on-list flag and decrements the count", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(
      DETAIL_KEY,
      classRow("cl-1", {
        visibility: "gray",
        waitingListCount: 3,
        coacheeStatus: { isEnrolled: false, isOnWaitingList: true, isWithinReach: true },
      }),
    );
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "waitlist-leave" });

    await onMutate("cl-1");

    const value = queryClient.getQueryData<TrainingClass>(DETAIL_KEY);
    expect(value?.coacheeStatus?.isOnWaitingList).toBe(false);
    expect(value?.waitingListCount).toBe(2);
  });

  it("claim flips the waiting-list class to an enrolled blue class in a list cache", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(
      LIST_KEY,
      listResponse([
        classRow("cl-1", {
          visibility: "gray",
          enrollmentCount: 3,
          waitingListCount: 2,
          coacheeStatus: { isEnrolled: false, isOnWaitingList: true, isWithinReach: true },
        }),
      ]),
    );
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "claim" });

    await onMutate("cl-1");

    const value = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    const cl1 = value?.data.find((c) => c.id === "cl-1");
    expect(cl1?.visibility).toBe("blue");
    expect(cl1?.coacheeStatus?.isEnrolled).toBe(true);
    expect(cl1?.coacheeStatus?.isOnWaitingList).toBe(false);
    expect(cl1?.enrollmentCount).toBe(4);
    expect(cl1?.waitingListCount).toBe(1);
  });

  it("updates classes in ALL classes-prefixed caches (multiple lists + detail)", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(LIST_KEY, listResponse([classRow("cl-1")]));
    queryClient.setQueryData(OTHER_LIST_KEY, listResponse([classRow("cl-1")]));
    queryClient.setQueryData(DETAIL_KEY, classRow("cl-1"));
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "join" });

    await onMutate("cl-1");

    for (const key of [LIST_KEY, OTHER_LIST_KEY]) {
      const value = queryClient.getQueryData<ListClassesResponse>(key);
      expect(value?.data[0].visibility).toBe("blue");
    }
    expect(queryClient.getQueryData<TrainingClass>(DETAIL_KEY)?.visibility).toBe("blue");
  });

  it("onError restores the EXACT pre-action snapshot in all touched caches", async () => {
    const queryClient = makeQueryClient();
    const before = listResponse([classRow("cl-1", { visibility: "green" })]);
    queryClient.setQueryData(LIST_KEY, before);
    queryClient.setQueryData(DETAIL_KEY, classRow("cl-1", { visibility: "green" }));
    const { onMutate, onError } = buildOptimisticClassMutation({ queryClient, action: "join" });

    const context = (await onMutate("cl-1")) as OptimisticSnapshot;
    expect(queryClient.getQueryData<ListClassesResponse>(LIST_KEY)?.data[0].visibility).toBe(
      "blue",
    );

    onError(new Error("boom"), "cl-1", context);

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(before);
    expect(queryClient.getQueryData<ListClassesResponse>(LIST_KEY)?.data[0].visibility).toBe(
      "green",
    );
    expect(queryClient.getQueryData<TrainingClass>(DETAIL_KEY)?.visibility).toBe("green");
  });

  it("does not touch classes that do not match the id", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(LIST_KEY, listResponse([classRow("cl-1"), classRow("cl-2")]));
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "waitlist-leave" });

    await onMutate("cl-2");

    const value = queryClient.getQueryData<ListClassesResponse>(LIST_KEY);
    expect(value?.data.find((c) => c.id === "cl-1")?.visibility).toBe("green");
    const cl2 = value?.data.find((c) => c.id === "cl-2");
    expect(cl2?.coacheeStatus?.isOnWaitingList).toBe(false);
  });

  it("leaves unmatched queries untouched when no class matches", async () => {
    const queryClient = makeQueryClient();
    const unrelated = { foo: "bar" };
    queryClient.setQueryData(["classes", "x"], listResponse([classRow("cl-5")]));
    queryClient.setQueryData(["unrelated"], unrelated);
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "join" });

    await onMutate("cl-99");

    expect(queryClient.getQueryData(["unrelated"])).toEqual(unrelated);
    expect(
      queryClient.getQueryData<ListClassesResponse>(["classes", "x"])?.data[0].visibility,
    ).toBe("green");
  });

  it("reconciles with the refetched server state after a successful mutation", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(LIST_KEY, listResponse([classRow("cl-1", { visibility: "green" })]));
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "join" });

    await onMutate("cl-1");
    expect(queryClient.getQueryData<ListClassesResponse>(LIST_KEY)?.data[0].visibility).toBe(
      "blue",
    );

    const serverData = listResponse([
      classRow("cl-1", {
        visibility: "blue",
        enrollmentCount: 3,
        coacheeStatus: { isEnrolled: true, isOnWaitingList: false, isWithinReach: true },
      }),
    ]);
    queryClient.setQueryData(LIST_KEY, serverData);

    expect(queryClient.getQueryData<ListClassesResponse>(LIST_KEY)).toEqual(serverData);
  });

  it("preserves the optimistic detail cache object shape so the refetch can replace it", async () => {
    const queryClient = makeQueryClient();
    queryClient.setQueryData(DETAIL_KEY, classRow("cl-1", { visibility: "blue" }));
    const { onMutate } = buildOptimisticClassMutation({ queryClient, action: "cancel" });

    await onMutate("cl-1");

    const cached = queryClient.getQueryData<TrainingClass>(DETAIL_KEY);
    expect(cached?.visibility).toBe("green");
    expect(cached?.coacheeStatus?.isEnrolled).toBe(false);
    queryClient.setQueryData(DETAIL_KEY, classRow("cl-1", { visibility: "green" }));
    expect(queryClient.getQueryData<TrainingClass>(DETAIL_KEY)?.visibility).toBe("green");
  });
});
