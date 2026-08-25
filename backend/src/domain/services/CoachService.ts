import type { CoachRepository } from "../ports/CoachRepository.js";

export class CoachService {
  constructor(private readonly repository: CoachRepository) {}

  async assertEmailUnique(email: string, excludeId?: string): Promise<void> {
    const existing = await this.repository.findByEmail(email);
    if (existing && existing.id !== excludeId) {
      throw new Error("Email already in use");
    }
  }
}
