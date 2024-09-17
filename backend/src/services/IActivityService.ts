import { Activity } from '../domain/models/Activity';

export interface IActivityService {
    createActivity(activityData: Partial<Activity>, tripId: string): Promise<Activity>;
    getActivityById(activityId: string): Promise<Activity>;
    getActivitiesByTripId(tripId: string): Promise<Activity[]>;
    updateActivity(activityId: string, updateData: Partial<Activity>): Promise<Activity>;
    deleteActivity(activityId: string): Promise<void>;
}