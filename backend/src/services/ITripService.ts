import { Trip } from '../domain/models/Trip';
import { Activity } from '../domain/models/Activity';

export interface ITripService {
    createTrip(tripData: Partial<Trip>, sessionId: string): Promise<Trip>;
    addActivityToTrip(tripId: string, activityData: Partial<Activity>): Promise<Trip>;
    getRecentTrips(sessionId: string, limit?: number): Promise<Trip[]>;
    getTripById(tripId: string): Promise<Trip>;
    updateTrip(tripId: string, updateData: Partial<Trip>): Promise<Trip>;
    deleteTrip(tripId: string): Promise<void>;
}