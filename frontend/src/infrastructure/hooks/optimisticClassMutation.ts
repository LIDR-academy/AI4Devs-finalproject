import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type { ListClassesResponse, TrainingClass } from "@/domain/types/class";
import {
  applyOptimisticClassUpdate,
  type ClassOptimisticAction,
} from "@/domain/utils/calendarInteraction";

export interface OptimisticSnapshotEntry {
  queryKey: QueryKey;
  data: unknown;
}

export type OptimisticSnapshot = OptimisticSnapshotEntry[];

function isListResponse(value: unknown): value is ListClassesResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "data" in value &&
    Array.isArray((value as ListClassesResponse).data)
  );
}

function isTrainingClass(value: unknown): value is TrainingClass {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "classType" in value &&
    "enrollmentCount" in value
  );
}

function applyToCachedValue(
  value: unknown,
  classId: string,
  action: ClassOptimisticAction,
): unknown {
  if (isListResponse(value)) {
    const data = value.data.map((cls) =>
      cls.id === classId ? applyOptimisticClassUpdate(cls, action) : cls,
    );
    return { ...value, data };
  }
  if (isTrainingClass(value) && value.id === classId) {
    return applyOptimisticClassUpdate(value, action);
  }
  return value;
}

export function buildOptimisticClassMutation({
  queryClient,
  action,
}: {
  queryClient: QueryClient;
  action: ClassOptimisticAction;
}) {
  return {
    onMutate: (classId: string): OptimisticSnapshot => {
      const snapshot: OptimisticSnapshot = [];
      const queries = queryClient.getQueriesData({ queryKey: ["classes"] });
      for (const [queryKey, data] of queries) {
        snapshot.push({ queryKey, data });
        queryClient.setQueryData(queryKey, applyToCachedValue(data, classId, action));
      }
      return snapshot;
    },
    onError: (_error: unknown, _classId: string, context: unknown) => {
      const snapshot = context as OptimisticSnapshot | undefined;
      if (!snapshot) {
        return;
      }
      for (const entry of snapshot) {
        queryClient.setQueryData(entry.queryKey, entry.data);
      }
    },
  };
}
