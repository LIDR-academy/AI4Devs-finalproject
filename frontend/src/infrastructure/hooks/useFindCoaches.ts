import { useQuery } from "@tanstack/react-query";
import type { Coach } from "@/domain/types/coach";
import { findCoaches } from "@/domain/usecases/findCoaches";
import type { PaginatedResponse } from "@/infrastructure/types/api";

export function useFindCoaches(status?: string, page = 1, limit = 20) {
  return useQuery<PaginatedResponse<Coach>>({
    queryKey: ["coaches", { status, page, limit }],
    queryFn: () => findCoaches(status, page, limit),
  });
}
