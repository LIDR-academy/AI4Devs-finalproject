import { Request, Response } from 'express';
import { CreatePlanUseCase } from '@/application/use-cases/create-plan.use-case';
import { ListProjectPlansUseCase } from '@/application/use-cases/list-project-plans.use-case';
import { GetPlanUseCase } from '@/application/use-cases/get-plan.use-case';

export class PlanController {
  constructor(
    private createPlanUseCase: CreatePlanUseCase,
    private listProjectPlansUseCase: ListProjectPlansUseCase,
    private getPlanUseCase: GetPlanUseCase
  ) {}

  async create(req: Request, res: Response) {
    try {
      const { projectId } = req.params;
      const { sheetName } = req.body; // CreatePlanDto

      if (!sheetName) {
        return res.status(400).json({ error: 'sheetName is required' });
      }

      const plan = await this.createPlanUseCase.execute(projectId, { sheetName });
      return res.status(201).json(plan);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to create plan' });
    }
  }

  async list(req: Request, res: Response) {
    try {
        const { projectId } = req.params;
        const plans = await this.listProjectPlansUseCase.execute(projectId);
        return res.status(200).json(plans);
    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to list plans' });
    }
  }

  async get(req: Request, res: Response) {
    try {
        const { planId } = req.params;
        const plan = await this.getPlanUseCase.execute(planId);
        
        if (!plan) return res.status(404).json({ error: 'Plan not found' });
        
        return res.status(200).json(plan);
    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get plan' });
    }
  }
}
