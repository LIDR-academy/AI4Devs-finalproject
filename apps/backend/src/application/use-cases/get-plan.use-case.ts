import { IPlanRepository } from '@/domain/plans/plan.repository';
import { Plan } from '@trace/core';

export class GetPlanUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(planId: string): Promise<Plan | null> {
    return this.planRepository.findById(planId);
  }
}
