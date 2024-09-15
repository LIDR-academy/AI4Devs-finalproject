import { Activity } from '../domain/models/Activity';

export interface IActivityService {
    getActivityById(id: string): Promise<Activity | null>;
    createActivity(activityData: Partial<Activity>): Promise<Activity>;
}