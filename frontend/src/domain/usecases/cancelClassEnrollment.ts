import type { CancelEnrollmentResponse } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function cancelClassEnrollment(id: string): Promise<CancelEnrollmentResponse> {
  return classesRepository.cancelEnrollment(id);
}
