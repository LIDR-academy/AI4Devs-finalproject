import { useQuery } from "@tanstack/react-query";
import type { Coachee } from "@/domain/types/coachee";
import { findCoachees } from "@/domain/usecases/findCoachees";
import type { PaginatedResponse } from "@/infrastructure/types/api";

export function useFindCoachees(status?: string, levelId?: string, page = 1, limit = 20) {
  return useQuery<PaginatedResponse<Coachee>>({
    queryKey: ["coachees", { status, levelId, page, limit }],
    queryFn: () => findCoachees(status, levelId, page, limit),
  });
}
