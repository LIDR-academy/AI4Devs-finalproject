import type { CoachFinancialData } from "@/domain/types/coach";
import { coachesRepository } from "@/infrastructure/repositories/coachesRepository";

export async function getCoachFinancialData(id: string): Promise<CoachFinancialData> {
  return coachesRepository.getFinancialData(id);
}
