import type { Coach } from "../../domain/entities/Coach.js";
import type { CoachRepository } from "../../domain/ports/CoachRepository.js";

export class GetCoach {
  constructor(private readonly repository: CoachRepository) {}

  async execute(id: string): Promise<Coach | null> {
    return this.repository.findById(id);
  }
}
