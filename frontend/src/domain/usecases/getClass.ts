import type { TrainingClass } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function getClass(id: string): Promise<TrainingClass> {
  return classesRepository.get(id);
}
