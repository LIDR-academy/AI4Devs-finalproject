import { Activity } from '../../domain/models/Activity';

export interface IActivityRepository {
  save(activity: Activity): Promise<Activity>;
  findById(id: string): Promise<Activity | null>;
}