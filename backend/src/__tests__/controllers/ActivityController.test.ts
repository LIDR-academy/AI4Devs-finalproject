import { ActivityController } from '../../controllers/ActivityController';
import { ActivityService } from '../../services/ActivityService';
import { ActivityRepository } from '../../infrastructure/repositories/ActivityRepository';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/ActivityService');
jest.mock('../../infrastructure/repositories/ActivityRepository');

describe('ActivityController', () => {
    let activityController: ActivityController;
    let activityService: jest.Mocked<ActivityService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        const activityRepository = new ActivityRepository() as jest.Mocked<ActivityRepository>;
        activityService = new ActivityService(activityRepository) as jest.Mocked<ActivityService>;
        activityController = new ActivityController();
        activityController['activityService'] = activityService;

        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    it('should create an activity', async () => {
        const mockActivity = {
            id: '1',
            name: 'Visit Eiffel Tower',
            description: 'A visit to the famous Eiffel Tower',
            sequence: 1,
            dateTime: new Date(),
            trip: {
                id: '1',
                name: 'Paris Trip',
                destination: 'Paris',
                startDate: new Date(),
                endDate: new Date(),
                description: 'Trip Description',
                activityCount: 0,
                accompaniment: ['Solo'],
                activityType: ['Sightseeing'],
                budgetMax: 1000,
                activities: [],
                user: { id: '1', sessionId: 'valid-session-id', creationDate: new Date(), lastLogin: new Date(), trips: [] },
            }
        };
        activityService.createActivity.mockResolvedValue(mockActivity);

        req.params = { tripId: '1' };
        req.body = { name: 'Visit Eiffel Tower', sequence: 1 };

        await activityController.createActivity(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it('should get an activity by id', async () => {
        const mockActivity = {
            id: '1',
            name: 'Visit Eiffel Tower',
            description: 'A visit to the famous Eiffel Tower',
            sequence: 1,
            dateTime: new Date(),
            trip: {
                id: '1',
                name: 'Paris Trip',
                destination: 'Paris',
                startDate: new Date(),
                endDate: new Date(),
                description: 'Trip Description',
                activityCount: 0,
                accompaniment: ['Solo'],
                activityType: ['Sightseeing'],
                budgetMax: 1000,
                activities: [],
                user: { id: '1', sessionId: 'valid-session-id', creationDate: new Date(), lastLogin: new Date(), trips: [] },
            }
        };
        activityService.getActivityById.mockResolvedValue(mockActivity);

        req.params = { id: '1' };

        await activityController.getActivityById(req as Request, res as Response, next);

        expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it('should get activities by trip id', async () => {
        const mockActivities = [{
            id: '1',
            name: 'Visit Eiffel Tower',
            description: 'A visit to the famous Eiffel Tower',
            sequence: 1,
            dateTime: new Date(),
            trip: {
                id: '1',
                name: 'Paris Trip',
                destination: 'Paris',
                startDate: new Date(),
                endDate: new Date(),
                description: 'Trip Description',
                activityCount: 0,
                accompaniment: ['Solo'],
                activityType: ['Sightseeing'],
                budgetMax: 1000,
                activities: [],
                user: { id: '1', sessionId: 'valid-session-id', creationDate: new Date(), lastLogin: new Date(), trips: [] },
            }
        }];
        activityService.getActivitiesByTripId.mockResolvedValue(mockActivities);

        req.params = { tripId: '1' };

        await activityController.getActivitiesByTripId(req as Request, res as Response, next);

        expect(res.json).toHaveBeenCalledWith(mockActivities);
    });

    it('should update an activity', async () => {
        const mockActivity = {
            id: '1',
            name: 'Visit Eiffel Tower',
            description: 'A visit to the famous Eiffel Tower',
            sequence: 1,
            dateTime: new Date(),
            trip: {
                id: '1',
                name: 'Paris Trip',
                destination: 'Paris',
                startDate: new Date(),
                endDate: new Date(),
                description: 'Trip Description',
                activityCount: 0,
                accompaniment: ['Solo'],
                activityType: ['Sightseeing'],
                budgetMax: 1000,
                activities: [],
                user: { id: '1', sessionId: 'valid-session-id', creationDate: new Date(), lastLogin: new Date(), trips: [] },
            }
        };
        activityService.updateActivity.mockResolvedValue(mockActivity);

        req.params = { id: '1' };
        req.body = { name: 'Updated Activity' };

        await activityController.updateActivity(req as Request, res as Response, next);

        expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it('should delete an activity', async () => {
        activityService.deleteActivity.mockResolvedValue();

        req.params = { id: '1' };

        await activityController.deleteActivity(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(204);
    });
});