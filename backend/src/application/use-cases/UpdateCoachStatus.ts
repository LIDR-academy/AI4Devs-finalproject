import type { Coach, CoachStatus } from "../../domain/entities/Coach.js";
import type { CoachRepository } from "../../domain/ports/CoachRepository.js";

export class UpdateCoachStatus {
  constructor(private readonly repository: CoachRepository) {}

  async execute(id: string, status: CoachStatus): Promise<Coach> {
    const coach = await this.repository.findById(id);
    if (!coach) {
      throw new Error("Coach not found");
    }
    return this.repository.updateStatus(id, status);
  }
}
