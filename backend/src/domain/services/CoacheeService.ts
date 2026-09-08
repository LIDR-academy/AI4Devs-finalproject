import type { CoacheeRepository } from "../ports/CoacheeRepository.js";

export class CoacheeService {
  constructor(private readonly repository: CoacheeRepository) {}

  async assertEmailUnique(email: string, excludeId?: string): Promise<void> {
    const existing = await this.repository.findByEmail(email);
    if (existing && existing.id !== excludeId) {
      throw new Error("Email already in use");
    }
  }
}
