import type { CoachFinancialData } from "../../domain/entities/Coach.js";
import type { CoachRepository } from "../../domain/ports/CoachRepository.js";
import type { EncryptionService } from "../../domain/ports/EncryptionService.js";

export class GetCoachFinancialData {
  constructor(
    private readonly repository: CoachRepository,
    private readonly encryption: EncryptionService,
  ) {}

  async execute(id: string): Promise<CoachFinancialData> {
    const raw = await this.repository.findFinancialData(id);
    if (!raw) {
      throw new Error("Coach not found");
    }
    return {
      id: raw.id,
      name: raw.name,
      bankAccount: this.encryption.decrypt(raw.bankAccount),
      ssn: this.encryption.decrypt(raw.ssn),
      dni: this.encryption.decrypt(raw.dni),
    };
  }
}
