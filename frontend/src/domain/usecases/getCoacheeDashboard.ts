import type { CoacheeDashboard } from "@/domain/types/coachee";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function getCoacheeDashboard(): Promise<CoacheeDashboard> {
  return classesRepository.getCoacheeDashboard();
}
