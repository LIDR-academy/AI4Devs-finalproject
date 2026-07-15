import type { Coach } from "../../domain/entities/Coach.js";
import type { CoachRepository } from "../../domain/ports/CoachRepository.js";
import type { CoachService } from "../../domain/services/CoachService.js";

export class UpdateCoach {
  constructor(
    private readonly repository: CoachRepository,
    private readonly coachService: CoachService,
  ) {}

  async execute(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      specialities?: string;
    },
  ): Promise<Coach> {
    if (data.email) {
      await this.coachService.assertEmailUnique(data.email, id);
    }

    const coach = await this.repository.update(id, {
      name: data.name ?? undefined,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      specialities: data.specialities ?? undefined,
    });

    return coach;
  }
}
