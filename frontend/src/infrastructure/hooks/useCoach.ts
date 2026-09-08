import { useQuery } from "@tanstack/react-query";
import { getCoachById } from "@/domain/usecases/getCoachById";

export function useCoach(id: string) {
  return useQuery({
    queryKey: ["coach", id],
    queryFn: () => getCoachById(id),
    enabled: !!id,
  });
}
