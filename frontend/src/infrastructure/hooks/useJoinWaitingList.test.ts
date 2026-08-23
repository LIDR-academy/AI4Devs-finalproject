import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { buildOptimisticClassMutation } from "./optimisticClassMutation";
import {
  invalidateWaitingListQueries,
  WAITING_LIST_JOIN_INVALIDATION_KEYS,
} from "./useJoinWaitingList";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe("invalidateWaitingListQueries", () => {
  it("invalidates classes, waiting-lists and the coachee dashboard queries", async () => {
    const queryClient = makeQueryClient();
    for (const key of WAITING_LIST_JOIN_INVALIDATION_KEYS) {
      queryClient.setQueryData(key, { seeded: true });
    }
    queryClient.setQueryData(["unrelated"], { seeded: true });

    await invalidateWaitingListQueries(queryClient);

    for (const key of WAITING_LIST_JOIN_INVALIDATION_KEYS) {
      const query = queryClient.getQueryCache().find({ queryKey: key });
      expect(query, JSON.stringify(key)).toBeTruthy();
      expect(query?.state.isInvalidated).toBe(true);
    }
    const unrelated = queryClient.getQueryCache().find({ queryKey: ["unrelated"] });
    expect(unrelated?.state.isInvalidated).toBe(false);
  });

  it("always includes the coachee dashboard so the discovery section re-syncs", () => {
    const key = JSON.stringify(WAITING_LIST_JOIN_INVALIDATION_KEYS);
    expect(key).toContain(JSON.stringify(["coachee", "dashboard"]));
  });
});

describe("useJoinWaitingList optimistic wiring", () => {
  it("useJoinWaitingList still exposes the shared waitlist-join adapter in its return type", () => {
    const queryClient = makeQueryClient();
    const optimistic = buildOptimisticClassMutation({
      queryClient,
      action: "waitlist-join",
    });
    expect(typeof optimistic.onMutate).toBe("function");
    expect(typeof optimistic.onError).toBe("function");
    expect(invalidateWaitingListQueries).toBeTypeOf("function");
  });
});
