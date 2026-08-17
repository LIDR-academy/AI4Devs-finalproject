import type { AvailableSlot, ClassType } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function getAvailableSlots(params: {
  date: string;
  coachId: string;
  classType: ClassType;
}): Promise<AvailableSlot[]> {
  return classesRepository.getAvailableSlots(params);
}
