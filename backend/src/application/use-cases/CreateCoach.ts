import bcrypt from "bcrypt";
import type { Coach } from "../../domain/entities/Coach.js";
import type { CoachRepository } from "../../domain/ports/CoachRepository.js";
import type { EncryptionService } from "../../domain/ports/EncryptionService.js";
import type { CoachService } from "../../domain/services/CoachService.js";

export class CreateCoach {
  constructor(
    private readonly repository: CoachRepository,
    private readonly coachService: CoachService,
    private readonly encryption: EncryptionService,
  ) {}

  async execute(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    specialities?: string;
    bankAccount: string;
    ssn: string;
    dni: string;
  }): Promise<Coach> {
    await this.coachService.assertEmailUnique(data.email);

    const passwordHash = await bcrypt.hash(data.password, 12);
    const encryptedBankAccount = this.encryption.encrypt(data.bankAccount);
    const encryptedSsn = this.encryption.encrypt(data.ssn);
    const encryptedDni = this.encryption.encrypt(data.dni);

    return this.repository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      phone: data.phone ?? null,
      specialities: data.specialities ?? null,
      bankAccount: encryptedBankAccount,
      ssn: encryptedSsn,
      dni: encryptedDni,
    });
  }
}
