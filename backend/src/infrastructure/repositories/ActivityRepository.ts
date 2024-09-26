import { Repository } from 'typeorm';
import { IActivityRepository } from './IActivityRepository';
import { Activity } from '../../domain/models/Activity';
import { AppDataSource } from '../../data-source';

export class ActivityRepository implements IActivityRepository {
    private repository: Repository<Activity>;

    constructor() {
        this.repository = AppDataSource.getRepository(Activity);
    }

    public async save(activity: Activity): Promise<Activity> {
        return this.repository.save(activity);
    }

    public async findById(id: string): Promise<Activity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['trip'],
        });
    }

    public async findByTripId(tripId: string): Promise<Activity[]> {
        return this.repository.find({
            where: { trip: { id: tripId } },
            relations: ['trip'],
            order: { sequence: 'ASC' },
        });
    }

    public async update(activity: Activity): Promise<Activity> {
        return this.repository.save(activity);
    }

    public async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    public async deleteByTripId(tripId: string): Promise<void> {
      await this.repository.delete({ trip: { id: tripId } });
    }
}