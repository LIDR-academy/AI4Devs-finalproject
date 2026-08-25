import type { CancelClassResponse, CancelClassScope } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function cancelClass(
  id: string,
  scope: CancelClassScope,
): Promise<CancelClassResponse> {
  return classesRepository.cancel(id, scope);
}
