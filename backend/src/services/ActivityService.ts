import { IActivityRepository } from '../infrastructure/repositories/IActivityRepository';
import { Activity } from '../domain/models/Activity';
import { NotFoundError } from '../domain/shared/NotFoundError';
import { IActivityService } from './IActivityService';

export class ActivityService implements IActivityService {
  constructor(private activityRepository: IActivityRepository) {}

  public async createActivity(activityData: Partial<Activity>): Promise<Activity> {
    const activity = new Activity();
    Object.assign(activity, activityData);
    return this.activityRepository.save(activity);
  }

  public async getActivityById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findById(id);
    if (!activity) {
      throw new NotFoundError(`Activity with id ${id} not found`);
    }
    return activity;
  }
}