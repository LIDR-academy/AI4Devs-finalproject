import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MatchesService } from './matches';
import type { MatchDto } from '../types/api';
import axios from 'axios';

// Mock axios.create used inside the service
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  };
  return {
    __esModule: true,
    default: {
      create: () => instance,
      _instance: instance,
    },
    create: () => instance,
    _instance: instance,
  };
});

describe('MatchesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findMatches', () => {
    it('should find matches with all parameters', async () => {
      const mockMatches: MatchDto[] = [
        {
          id: '1',
          tripId: 'trip1',
          driverId: 'driver1',
          origin: '40.4168,-3.7038',
          destinationSedeId: 'SEDE-1',
          dateTime: '2024-01-01T08:00:00Z',
          seatsFree: 2,
          score: 0.85,
          reasons: ['Ubicación cercana', 'Horario compatible'],
        },
      ];

      (axios as any)._instance.get.mockResolvedValue({ data: mockMatches });

      const params = {
        destinationSedeId: 'SEDE-1',
        time: '08:30',
        origin: '40.4168,-3.7038',
      };

      const result = await MatchesService.findMatches(params);

      expect((axios as any)._instance.get).toHaveBeenCalledWith(
        '/matches?destinationSedeId=SEDE-1&time=08%3A30&origin=40.4168%2C-3.7038'
      );
      expect(result).toEqual(mockMatches);
    });

    it('should find matches with only destination', async () => {
      const mockMatches: MatchDto[] = [];

      (axios as any)._instance.get.mockResolvedValue({ data: mockMatches });

      const params = {
        destinationSedeId: 'SEDE-1',
      };

      const result = await MatchesService.findMatches(params);

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/matches?destinationSedeId=SEDE-1');
      expect(result).toEqual(mockMatches);
    });

    it('should find matches with destination and time', async () => {
      const mockMatches: MatchDto[] = [];

      (axios as any)._instance.get.mockResolvedValue({ data: mockMatches });

      const params = {
        destinationSedeId: 'SEDE-1',
        time: '09:00',
      };

      const result = await MatchesService.findMatches(params);

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/matches?destinationSedeId=SEDE-1&time=09%3A00');
      expect(result).toEqual(mockMatches);
    });

    it('propagates API errors', async () => {
      (axios as any)._instance.get.mockRejectedValueOnce(new Error('Network Error'));
      await expect(
        MatchesService.findMatches({ destinationSedeId: 'SEDE-1' })
      ).rejects.toThrow('Network Error');
    });
  });

  describe('getMyMatches', () => {
    it('should fetch user matches', async () => {
      const mockMatches: MatchDto[] = [];

      (axios as any)._instance.get.mockResolvedValue({ data: mockMatches });

      const result = await MatchesService.getMyMatches();

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/matches/my-matches');
      expect(result).toEqual(mockMatches);
    });
  });

  describe('getMatchById', () => {
    it('should fetch match by id', async () => {
      const mockMatch: MatchDto = {
        id: '1',
        tripId: 'trip1',
        driverId: 'driver1',
        origin: '40.4168,-3.7038',
        destinationSedeId: 'SEDE-1',
        dateTime: '2024-01-01T08:00:00Z',
        seatsFree: 2,
        score: 0.85,
        reasons: ['Ubicación cercana'],
      };

      (axios as any)._instance.get.mockResolvedValue({ data: mockMatch });

      const result = await MatchesService.getMatchById('1');

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/matches/1');
      expect(result).toEqual(mockMatch);
    });
  });
});
