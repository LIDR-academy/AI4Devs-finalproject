import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/ActivityService';
import { ActivityRepository } from '../infrastructure/repositories/ActivityRepository';

export class ActivityController {
  private activityService: ActivityService;

  constructor() {
    const activityRepository = new ActivityRepository();
    this.activityService = new ActivityService(activityRepository);
  }

  async createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await this.activityService.createActivity(req.body);
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  }

  async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await this.activityService.getActivityById(req.params.id);
      if (!activity) {
        res.status(404).json({ message: 'Activity not found' });
        return;
      }
      res.json(activity);
    } catch (error) {
      next(error);
    }
  }
}