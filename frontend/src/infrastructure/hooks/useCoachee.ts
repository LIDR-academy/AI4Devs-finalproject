import { useQuery } from "@tanstack/react-query";
import { getCoacheeById } from "@/domain/usecases/getCoacheeById";

export function useCoachee(id: string) {
  return useQuery({
    queryKey: ["coachee", id],
    queryFn: () => getCoacheeById(id),
    enabled: !!id,
  });
}
