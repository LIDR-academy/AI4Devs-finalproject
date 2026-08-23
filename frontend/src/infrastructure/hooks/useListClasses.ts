import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ListClassesParams, ListClassesResponse } from "@/domain/types/class";
import { listClasses } from "@/domain/usecases/listClasses";

export function useListClasses(params: ListClassesParams) {
  return useQuery<ListClassesResponse>({
    queryKey: [
      "classes",
      params.start,
      params.end,
      params.classType ?? "all",
      params.coachId ?? "all",
      params.page ?? 1,
      params.limit ?? 20,
    ],
    queryFn: () => listClasses(params),
    placeholderData: keepPreviousData,
  });
}
