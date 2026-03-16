import { Request, Response, NextFunction } from 'express';
import { IActivityService } from '../services/IActivityService';
import { ActivityService } from '../services/ActivityService';
import { ActivityRepository } from '../infrastructure/repositories/ActivityRepository';

export class ActivityController {
  private activityService: IActivityService;

  constructor() {
    const activityRepository = new ActivityRepository();
    this.activityService = new ActivityService(activityRepository);
  }

  async createActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const activity = await this.activityService.createActivity(req.body, tripId);
      res.status(201).json(activity);
    } catch (error) {
      next(error);
    }
  }

  async getActivityById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activity = await this.activityService.getActivityById(req.params.id);
      res.json(activity);
    } catch (error) {
      next(error);
    }
  }

  async getActivitiesByTripId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const activities = await this.activityService.getActivitiesByTripId(tripId);
      res.json(activities);
    } catch (error) {
      next(error);
    }
  }

  async updateActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updatedActivity = await this.activityService.updateActivity(id, req.body);
      res.json(updatedActivity);
    } catch (error) {
      next(error);
    }
  }

  async updateActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tripId } = req.params;
      const { activities } = req.body;

      await this.activityService.deleteActivitiesByTripId(tripId);

      const newActivities = await Promise.all(
        activities.map((description: string, index: number) => {
          const activityData = {
            name: `Day ${index + 1}`,
            description,
            tripId,
            sequence: index + 1
          };
          return this.activityService.createActivity(activityData, tripId);
        })
      );

      res.status(201).json(newActivities);
    } catch (error) {
      next(error);
    }
  }

  async deleteActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.activityService.deleteActivity(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}