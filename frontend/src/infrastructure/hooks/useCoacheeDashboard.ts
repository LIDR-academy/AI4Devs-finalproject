import { useQuery } from "@tanstack/react-query";
import type { CoacheeDashboard } from "@/domain/types/coachee";
import { getCoacheeDashboard } from "@/domain/usecases/getCoacheeDashboard";

export function useCoacheeDashboard() {
  return useQuery<CoacheeDashboard>({
    queryKey: ["coachee", "dashboard"],
    queryFn: () => getCoacheeDashboard(),
  });
}
