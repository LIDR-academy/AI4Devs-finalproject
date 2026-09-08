import { useQuery } from "@tanstack/react-query";
import { getLevels } from "@/domain/usecases/getLevels";

export function useLevels() {
  return useQuery({
    queryKey: ["levels"],
    queryFn: () => getLevels(),
  });
}
