import { useQuery } from "@tanstack/react-query";
import type { TrainingClass } from "@/domain/types/class";
import { getClass } from "@/domain/usecases/getClass";

export function useClassDetail(id: string) {
  return useQuery<TrainingClass>({
    queryKey: ["classes", id],
    queryFn: () => getClass(id),
    enabled: id.length > 0,
  });
}
