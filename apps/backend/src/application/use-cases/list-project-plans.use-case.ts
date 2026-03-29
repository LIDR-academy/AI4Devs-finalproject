import { IPlanRepository } from '@/domain/plans/plan.repository';
import { Plan } from '@trace/core';

export class ListProjectPlansUseCase {
  constructor(private planRepository: IPlanRepository) {}

  async execute(projectId: string): Promise<{ sheetName: string; latestVersion: number; plans: Plan[] }[]> {
    const plans = await this.planRepository.findByProject(projectId);
    
    // Group by sheetName
    const grouped: Record<string, Plan[]> = {};
    
    plans.forEach(plan => {
      if (!grouped[plan.sheetName]) {
        grouped[plan.sheetName] = [];
      }
      grouped[plan.sheetName].push(plan);
    });

    // Transform to array expected by Frontend
    return Object.keys(grouped).map(sheetName => {
        const sheetPlans = grouped[sheetName];
        // Sort by version desc
        sheetPlans.sort((a, b) => b.version - a.version);
        
        return {
            sheetName,
            latestVersion: sheetPlans[0].version,
            plans: sheetPlans
        };
    });
  }
}
