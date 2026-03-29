import { Plan } from '@trace/core';

export interface IPlanRepository {
  findLatestVersion(projectId: string, sheetName: string): Promise<Plan | null>;
  save(plan: Plan): Promise<Plan>;
  findByProject(projectId: string): Promise<Plan[]>;
  findById(planId: string): Promise<Plan | null>;
}
