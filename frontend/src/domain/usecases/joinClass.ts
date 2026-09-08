import type { EnrollResponse } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function joinClass(id: string): Promise<EnrollResponse> {
  return classesRepository.join(id);
}
