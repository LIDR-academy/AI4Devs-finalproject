import type { ListClassesParams, ListClassesResponse } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function listClasses(params: ListClassesParams): Promise<ListClassesResponse> {
  return classesRepository.list(params);
}
