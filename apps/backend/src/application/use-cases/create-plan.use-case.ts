import { IPlanRepository } from '@/domain/plans/plan.repository';
import { CreatePlanDto } from '@/domain/dtos/create-plan.dto';
import { Plan } from '@trace/core';

export class CreatePlanUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(projectId: string, dto: CreatePlanDto): Promise<Plan> {
    // 1. Check for existing version
    const latestPlan = await this.planRepository.findLatestVersion(projectId, dto.sheetName);
    
    let nextVersion = 1;
    if (latestPlan) {
      nextVersion = latestPlan.version + 1;
    }

    // 2. Create new plan instance (Domain logic)
    const newPlan = Plan.create(projectId, dto.sheetName, nextVersion);

    // 3. Persist
    return this.planRepository.save(newPlan);
  }
}
