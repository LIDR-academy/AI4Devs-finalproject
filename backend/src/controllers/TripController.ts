import { Request, Response, NextFunction } from 'express';
import { TripService } from '../services/TripService';
import { TripRepository } from '../infrastructure/repositories/TripRepository';
import { UserRepository } from '../infrastructure/repositories/UserRepository';

export class TripController {
    private tripService: TripService;

    constructor() {
        const tripRepository = new TripRepository();
        const userRepository = new UserRepository();
        this.tripService = new TripService(tripRepository, userRepository);
    }

    async createTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sessionId = req.headers['x-session-id'] as string;
            if (!sessionId) {
                res.status(400).json({ message: 'Session ID is required' });
                return;
            }

            const trip = await this.tripService.createTrip(req.body, sessionId);
            res.status(201).json(trip);
        } catch (error) {
            next(error);
        }
    }

    async addActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tripId } = req.params;
            const trip = await this.tripService.addActivityToTrip(tripId, req.body);
            res.status(201).json(trip);
        } catch (error) {
            next(error);
        }
    }

    async getRecentTrips(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const sessionId = req.headers['x-session-id'] as string;
            if (!sessionId) {
                res.status(400).json({ message: 'Session ID is required' });
                return;
            }

            const trips = await this.tripService.getRecentTrips(sessionId);
            res.json(trips);
        } catch (error) {
            next(error);
        }
    }

    async getTripById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tripId } = req.params;
            const trip = await this.tripService.getTripById(tripId);
            res.json(trip);
        } catch (error) {
            next(error);
        }
    }

    async updateTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tripId } = req.params;
            const updatedTrip = await this.tripService.updateTrip(tripId, req.body);
            res.json(updatedTrip);
        } catch (error) {
            next(error);
        }
    }

    async deleteTrip(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { tripId } = req.params;
            await this.tripService.deleteTrip(tripId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}