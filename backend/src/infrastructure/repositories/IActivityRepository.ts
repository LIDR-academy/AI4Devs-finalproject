import { Activity } from '../../domain/models/Activity';

export interface IActivityRepository {
  save(activity: Activity): Promise<Activity>;
  findById(id: string): Promise<Activity | null>;
  findByTripId(tripId: string): Promise<Activity[]>;
  update(activity: Activity): Promise<Activity>;
  delete(id: string): Promise<void>;
}