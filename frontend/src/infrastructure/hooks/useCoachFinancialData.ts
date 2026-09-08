import { useQuery } from "@tanstack/react-query";
import { getCoachFinancialData } from "@/domain/usecases/getCoachFinancialData";

export function useCoachFinancialData(id: string) {
  return useQuery({
    queryKey: ["coachFinancial", id],
    queryFn: () => getCoachFinancialData(id),
    enabled: !!id,
  });
}
