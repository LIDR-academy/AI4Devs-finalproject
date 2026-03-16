import { ActivityRepository } from '../../../infrastructure/repositories/ActivityRepository';
import { Activity } from '../../../domain/models/Activity';
import { Trip } from '../../../domain/models/Trip';
import { AppDataSource } from '../../../data-source';

jest.mock('../../../data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('ActivityRepository', () => {
  let activityRepository: ActivityRepository;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    activityRepository = new ActivityRepository();
  });

  describe('save', () => {
    it('should save an activity', async () => {
      const activity = new Activity();
      mockRepository.save.mockResolvedValue(activity);

      const result = await activityRepository.save(activity);

      expect(mockRepository.save).toHaveBeenCalledWith(activity);
      expect(result).toBe(activity);
    });
  });

  describe('findById', () => {
    it('should find an activity by id', async () => {
      const activity = new Activity();
      mockRepository.findOne.mockResolvedValue(activity);

      const result = await activityRepository.findById('activity-id');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'activity-id' },
        relations: ['trip'],
      });
      expect(result).toBe(activity);
    });

    it('should return null if activity is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await activityRepository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByTripId', () => {
    it('should find activities by trip id', async () => {
      const activities = [new Activity(), new Activity()];
      mockRepository.find.mockResolvedValue(activities);

      const result = await activityRepository.findByTripId('trip-id');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { trip: { id: 'trip-id' } },
        relations: ['trip'],
        order: { sequence: 'ASC' },
      });
      expect(result).toBe(activities);
    });
  });

  describe('update', () => {
    it('should update an activity', async () => {
      const activity = new Activity();
      mockRepository.save.mockResolvedValue(activity);

      const result = await activityRepository.update(activity);

      expect(mockRepository.save).toHaveBeenCalledWith(activity);
      expect(result).toBe(activity);
    });
  });

  describe('delete', () => {
    it('should delete an activity', async () => {
      await activityRepository.delete('activity-id');

      expect(mockRepository.delete).toHaveBeenCalledWith('activity-id');
    });
  });

  describe('deleteByTripId', () => {
    it('should delete activities by trip id', async () => {
      await activityRepository.deleteByTripId('trip-id');

      expect(mockRepository.delete).toHaveBeenCalledWith({
        trip: { id: 'trip-id' },
      });
    });
  });
});