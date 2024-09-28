import { TripController } from '../../controllers/TripController';
import { TripService } from '../../services/TripService';
import { TripRepository } from '../../infrastructure/repositories/TripRepository';
import { UserRepository } from '../../infrastructure/repositories/UserRepository';
import { Request, Response, NextFunction } from 'express';

jest.mock('../../services/TripService');
jest.mock('../../infrastructure/repositories/TripRepository');
jest.mock('../../infrastructure/repositories/UserRepository');

describe('TripController', () => {
  let tripController: TripController;
  let tripService: jest.Mocked<TripService>;
  let tripRepository: jest.Mocked<TripRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    tripRepository = new TripRepository() as jest.Mocked<TripRepository>;
    userRepository = new UserRepository() as jest.Mocked<UserRepository>;
    tripService = new TripService(tripRepository, userRepository) as jest.Mocked<TripService>;
    tripController = new TripController();
    tripController['tripService'] = tripService;

    req = {};
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should create a trip', async () => {
    const mockTrip = {
      id: 'trip-id',
      destination: 'Paris',
      startDate: new Date(),
      endDate: new Date(),
      description: 'A trip to Paris',
      activityCount: 0,
      accompaniment: [],
      activityType: [],
      budgetMax: 1000,
      activities: [],
      user: {
        id: 'user-id',
        sessionId: 'valid-session-id',
        creationDate: new Date(),
        lastLogin: new Date(),
        trips: []
      }
    };
    tripService.createTrip.mockResolvedValue(mockTrip);
    req.headers = { 'x-session-id': 'valid-session-id' };
    req.body = { destination: 'Paris' };

    await tripController.createTrip(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockTrip);
  });

  it('should get a trip by id', async () => {
    const mockTrip = {
      id: 'trip-id',
      destination: 'Paris',
      startDate: new Date(),
      endDate: new Date(),
      description: 'A trip to Paris',
      activityCount: 0,
      accompaniment: [],
      activityType: [],
      budgetMax: 1000,
      activities: [],
      user: {
        id: 'user-id',
        sessionId: 'valid-session-id',
        creationDate: new Date(),
        lastLogin: new Date(),
        trips: []
      }
    };
    tripService.getTripById.mockResolvedValue(mockTrip);
    req.params = { tripId: '1' };

    await tripController.getTripById(req as Request, res as Response, next);

    expect(res.json).toHaveBeenCalledWith(mockTrip);
  });
});