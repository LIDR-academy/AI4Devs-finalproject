import { useQuery } from "@tanstack/react-query";
import type { AssignableCoach } from "@/domain/types/coach";
import { getAssignableCoaches } from "@/domain/usecases/getAssignableCoaches";

export function useAssignableCoaches() {
  return useQuery<AssignableCoach[]>({
    queryKey: ["assignable-coaches"],
    queryFn: () => getAssignableCoaches(),
  });
}
