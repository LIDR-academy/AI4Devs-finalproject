import bcrypt from "bcrypt";
import type { Coachee, CreateCoacheeData } from "../../domain/entities/Coachee.js";
import type { CoacheeRepository } from "../../domain/ports/CoacheeRepository.js";
import type { CoacheeService } from "../../domain/services/CoacheeService.js";

export class CreateCoachee {
  constructor(
    private readonly repository: CoacheeRepository,
    private readonly service: CoacheeService,
  ) {}

  async execute(data: CreateCoacheeData): Promise<Coachee> {
    await this.service.assertEmailUnique(data.email);
    const passwordHash = await bcrypt.hash(data.phone, 12);
    return this.repository.create({ ...data, passwordHash });
  }
}
