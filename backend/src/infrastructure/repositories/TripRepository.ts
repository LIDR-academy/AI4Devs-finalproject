import { Repository } from 'typeorm';
import { ITripRepository } from './ITripRespository';
import { Trip } from '../../domain/models/Trip';
import { AppDataSource } from '../../data-source';

export class TripRepository implements ITripRepository {
    private repository: Repository<Trip>;

    constructor() {
        this.repository = AppDataSource.getRepository(Trip);
    }

    public async save(trip: Trip): Promise<Trip> {
        return this.repository.save(trip);
    }

    public async findById(id: string): Promise<Trip | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['activities', 'user'],
        });
    }

    public async findRecentByUser(sessionId: string, limit: number = 3): Promise<Trip[]> {
        return this.repository.find({
            where: { user: { sessionId } },
            order: { startDate: 'DESC' },
            take: limit,
            relations: ['activities'],
        });
    }

    public async update(trip: Trip): Promise<Trip> {
        return this.repository.save(trip);
    }

    public async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}