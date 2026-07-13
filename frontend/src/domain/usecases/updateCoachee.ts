import type { Coachee } from "@/domain/types/coachee";
import { coacheesRepository } from "@/infrastructure/repositories/coacheesRepository";

export async function updateCoachee(
  id: string,
  fields: {
    name?: string;
    email?: string;
    phone?: string;
    classTypePreference?: string | null;
    additionalInfo?: string | null;
  },
): Promise<Coachee> {
  return coacheesRepository.update(id, fields);
}
