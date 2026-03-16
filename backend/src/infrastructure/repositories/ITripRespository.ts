import { Trip } from '../../domain/models/Trip';

export interface ITripRepository {
    save(trip: Trip): Promise<Trip>;
    findById(id: string): Promise<Trip | null>;
    findRecentByUser(sessionId: string, limit: number): Promise<Trip[]>;
    update(trip: Trip): Promise<Trip>;
    delete(id: string): Promise<void>;
}