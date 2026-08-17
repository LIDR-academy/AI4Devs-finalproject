import type { AssignableCoach } from "@/domain/types/coach";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function getAssignableCoaches(): Promise<AssignableCoach[]> {
  return classesRepository.getAssignableCoaches();
}
