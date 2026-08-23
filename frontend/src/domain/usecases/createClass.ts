import type { CreateClassPayload, CreateClassResponse } from "@/domain/types/class";
import { classesRepository } from "@/infrastructure/repositories/classesRepository";

export async function createClass(payload: CreateClassPayload): Promise<CreateClassResponse> {
  return classesRepository.create(payload);
}
