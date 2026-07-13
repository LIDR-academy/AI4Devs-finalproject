import type { Coachee } from "../../domain/entities/Coachee.js";
import type { CoacheeRepository } from "../../domain/ports/CoacheeRepository.js";
import { NotFoundError } from "../../infrastructure/errors.js";

export class GetCoachee {
  constructor(private readonly repository: CoacheeRepository) {}

  async execute(id: string): Promise<Coachee> {
    const coachee = await this.repository.findById(id);
    if (!coachee) {
      throw new NotFoundError("Coachee not found");
    }
    return coachee;
  }
}
