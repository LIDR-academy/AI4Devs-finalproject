import { ActivityService } from '../../services/ActivityService';
import { IActivityRepository } from '../../infrastructure/repositories/IActivityRepository';
import { TripRepository } from '../../infrastructure/repositories/TripRepository';
import { Activity } from '../../domain/models/Activity';
import { Trip } from '../../domain/models/Trip';
import { NotFoundError } from '../../domain/shared/NotFoundError';

jest.mock('../../infrastructure/repositories/TripRepository');

describe('ActivityService', () => {
  let activityService: ActivityService;
  let mockActivityRepository: jest.Mocked<IActivityRepository>;
  let mockTripRepository: jest.Mocked<TripRepository>;

  beforeEach(() => {
    mockActivityRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTripId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteByTripId: jest.fn(),
    };
    mockTripRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<TripRepository>;
    jest.spyOn(TripRepository.prototype, 'findById').mockImplementation(mockTripRepository.findById);
    activityService = new ActivityService(mockActivityRepository);
  });

  describe('createActivity', () => {
    it('should create an activity when trip exists', async () => {
      const mockTrip = { id: 'trip-1' } as Trip;
      const mockActivity = { name: 'Test Activity' } as Activity;
      mockTripRepository.findById.mockResolvedValue(mockTrip);
      mockActivityRepository.save.mockResolvedValue({ ...mockActivity, id: 'activity-1', trip: mockTrip });

      const result = await activityService.createActivity(mockActivity, 'trip-1');

      expect(mockTripRepository.findById).toHaveBeenCalledWith('trip-1');
      expect(mockActivityRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Activity',
        trip: mockTrip
      }));
      expect(result).toEqual(expect.objectContaining({
        id: 'activity-1',
        name: 'Test Activity',
        trip: mockTrip
      }));
    });

    it('should throw NotFoundError when trip does not exist', async () => {
      mockTripRepository.findById.mockResolvedValue(null);

      await expect(activityService.createActivity({} as Activity, 'non-existent-trip'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getActivityById', () => {
    it('should return an activity when it exists', async () => {
      const mockActivity = { id: 'activity-1', name: 'Test Activity' } as Activity;
      mockActivityRepository.findById.mockResolvedValue(mockActivity);

      const result = await activityService.getActivityById('activity-1');

      expect(mockActivityRepository.findById).toHaveBeenCalledWith('activity-1');
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundError when activity does not exist', async () => {
      mockActivityRepository.findById.mockResolvedValue(null);

      await expect(activityService.getActivityById('non-existent-activity'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('getActivitiesByTripId', () => {
    it('should return activities for a given trip id', async () => {
      const mockActivities = [
        { id: 'activity-1', name: 'Activity 1' },
        { id: 'activity-2', name: 'Activity 2' }
      ] as Activity[];
      mockActivityRepository.findByTripId.mockResolvedValue(mockActivities);

      const result = await activityService.getActivitiesByTripId('trip-1');

      expect(mockActivityRepository.findByTripId).toHaveBeenCalledWith('trip-1');
      expect(result).toEqual(mockActivities);
    });
  });

  describe('updateActivity', () => {
    it('should update an activity when it exists', async () => {
      const existingActivity = { id: 'activity-1', name: 'Old Name' } as Activity;
      const updatedActivity = { id: 'activity-1', name: 'New Name' } as Activity;
      mockActivityRepository.findById.mockResolvedValue(existingActivity);
      mockActivityRepository.save.mockResolvedValue(updatedActivity);

      const result = await activityService.updateActivity('activity-1', { name: 'New Name' });

      expect(mockActivityRepository.findById).toHaveBeenCalledWith('activity-1');
      expect(mockActivityRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'activity-1',
        name: 'New Name'
      }));
      expect(result).toEqual(updatedActivity);
    });

    it('should throw NotFoundError when activity does not exist', async () => {
      mockActivityRepository.findById.mockResolvedValue(null);

      await expect(activityService.updateActivity('non-existent-activity', {}))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteActivity', () => {
    it('should delete an activity when it exists', async () => {
      const mockActivity = { id: 'activity-1' } as Activity;
      mockActivityRepository.findById.mockResolvedValue(mockActivity);

      await activityService.deleteActivity('activity-1');

      expect(mockActivityRepository.findById).toHaveBeenCalledWith('activity-1');
      expect(mockActivityRepository.delete).toHaveBeenCalledWith('activity-1');
    });

    it('should throw NotFoundError when activity does not exist', async () => {
      mockActivityRepository.findById.mockResolvedValue(null);

      await expect(activityService.deleteActivity('non-existent-activity'))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteActivitiesByTripId', () => {
    it('should delete all activities for a given trip id', async () => {
      await activityService.deleteActivitiesByTripId('trip-1');

      expect(mockActivityRepository.deleteByTripId).toHaveBeenCalledWith('trip-1');
    });
  });
});