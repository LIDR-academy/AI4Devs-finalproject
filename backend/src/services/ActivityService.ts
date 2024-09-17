import { IActivityService } from './IActivityService';
import { IActivityRepository } from '../infrastructure/repositories/IActivityRepository';
import { Activity } from '../domain/models/Activity';
import { NotFoundError } from '../domain/shared/NotFoundError';
import { TripRepository } from '../infrastructure/repositories/TripRepository';

export class ActivityService implements IActivityService {
    constructor(private activityRepository: IActivityRepository) {}

    public async createActivity(activityData: Partial<Activity>, tripId: string): Promise<Activity> {
        const tripRepository = new TripRepository();
        const trip = await tripRepository.findById(tripId);
        if (!trip) {
            throw new NotFoundError(`Trip with id ${tripId} not found`);
        }

        const activity = new Activity();
        Object.assign(activity, activityData);
        activity.trip = trip;

        return this.activityRepository.save(activity);
    }

    public async getActivityById(activityId: string): Promise<Activity> {
        const activity = await this.activityRepository.findById(activityId);
        if (!activity) {
            throw new NotFoundError(`Activity with id ${activityId} not found`);
        }
        return activity;
    }

    public async getActivitiesByTripId(tripId: string): Promise<Activity[]> {
        const activities = await this.activityRepository.findByTripId(tripId);
        return activities;
    }

    public async updateActivity(activityId: string, updateData: Partial<Activity>): Promise<Activity> {
        const activity = await this.activityRepository.findById(activityId);
        if (!activity) {
            throw new NotFoundError(`Activity with id ${activityId} not found`);
        }
        Object.assign(activity, updateData);
        return this.activityRepository.save(activity);
    }

    public async deleteActivity(activityId: string): Promise<void> {
        const activity = await this.activityRepository.findById(activityId);
        if (!activity) {
            throw new NotFoundError(`Activity with id ${activityId} not found`);
        }
        await this.activityRepository.delete(activityId);
    }
}