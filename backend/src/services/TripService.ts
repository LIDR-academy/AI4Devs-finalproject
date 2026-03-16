import { ITripService } from './ITripService';
import { ITripRepository } from '../infrastructure/repositories/ITripRespository';
import { IUserRepository } from '../infrastructure/repositories/IUserRepository';
import { Trip } from '../domain/models/Trip';
import { NotFoundError } from '../domain/shared/NotFoundError';
import { Activity } from '../domain/models/Activity';

export class TripService implements ITripService {
    constructor(
        private tripRepository: ITripRepository,
        private userRepository: IUserRepository
    ) {}

    public async createTrip(tripData: Partial<Trip>, sessionId: string): Promise<Trip> {
        const user = await this.userRepository.findBySessionId(sessionId);
        if (!user) {
            throw new NotFoundError(`User with sessionId ${sessionId} not found`);
        }

        const trip = new Trip();
        Object.assign(trip, tripData);
        trip.user = user;
        trip.activityCount = 0;

        return this.tripRepository.save(trip);
    }

    public async addActivityToTrip(tripId: string, activityData: Partial<Activity>): Promise<Trip> {
        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
            throw new NotFoundError(`Trip with id ${tripId} not found`);
        }

        const activity = new Activity();
        Object.assign(activity, activityData);
        activity.trip = trip;

        trip.activities.push(activity);
        trip.activityCount += 1;

        return this.tripRepository.save(trip);
    }

    public async getRecentTrips(sessionId: string, limit: number = 3): Promise<Trip[]> {
        return this.tripRepository.findRecentByUser(sessionId, limit);
    }

    public async getTripById(tripId: string): Promise<Trip> {
        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
            throw new NotFoundError(`Trip with id ${tripId} not found`);
        }
        return trip;
    }

    public async updateTrip(tripId: string, updateData: Partial<Trip>): Promise<Trip> {
        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
            throw new NotFoundError(`Trip with id ${tripId} not found`);
        }
        Object.assign(trip, updateData);
        return this.tripRepository.save(trip);
    }

    public async deleteTrip(tripId: string): Promise<void> {
        const trip = await this.tripRepository.findById(tripId);
        if (!trip) {
            throw new NotFoundError(`Trip with id ${tripId} not found`);
        }
        await this.tripRepository.delete(tripId);
    }
}