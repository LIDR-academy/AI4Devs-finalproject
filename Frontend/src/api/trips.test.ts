import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TripsService } from './trips';
import type { TripDto, TripCreateDto } from '../types/api';
import axios from 'axios';

// Mock axios.create used inside the service, expose a shared instance
jest.mock('axios', () => {
  const instance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
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

describe('TripsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTrips', () => {
    it('should fetch all trips', async () => {
      const mockTrips: TripDto[] = [
        {
          id: '1',
          driverId: 'driver1',
          origin: { lat: 40.4168, lng: -3.7038 },
          destinationSedeId: 'SEDE-1',
          dateTime: '2024-01-01T08:00:00Z',
          seatsTotal: 4,
          seatsFree: 2,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      (axios as any)._instance.get.mockResolvedValue({ data: mockTrips });

      const result = await TripsService.getAllTrips();

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/trips');
      expect(result).toEqual(mockTrips);
    });

    it('propagates API errors', async () => {
      (axios as any)._instance.get.mockRejectedValueOnce(new Error('Boom'));
      await expect(TripsService.getAllTrips()).rejects.toThrow('Boom');
    });
  });

  describe('getTripsByDestination', () => {
    it('should fetch trips by destination', async () => {
      const mockTrips: TripDto[] = [];
      const destinationSedeId = 'SEDE-1';

      (axios as any)._instance.get.mockResolvedValue({ data: mockTrips });

      const result = await TripsService.getTripsByDestination(destinationSedeId);

      expect((axios as any)._instance.get).toHaveBeenCalledWith(`/trips?destinationSedeId=${destinationSedeId}`);
      expect(result).toEqual(mockTrips);
    });
  });

  describe('getTripById', () => {
    it('should fetch trip by id', async () => {
      const mockTrip: TripDto = {
        id: '1',
        driverId: 'driver1',
        origin: { lat: 40.4168, lng: -3.7038 },
        destinationSedeId: 'SEDE-1',
        dateTime: '2024-01-01T08:00:00Z',
        seatsTotal: 4,
        seatsFree: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (axios as any)._instance.get.mockResolvedValue({ data: mockTrip });

      const result = await TripsService.getTripById('1');

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/trips/1');
      expect(result).toEqual(mockTrip);
    });
  });

  describe('createTrip', () => {
    it('should create a new trip', async () => {
      const tripData: TripCreateDto = {
        origin: { lat: 40.4168, lng: -3.7038 },
        destinationSedeId: 'SEDE-1',
        dateTime: '2024-01-01T08:00:00Z',
        seatsTotal: 4,
      };

      const mockCreatedTrip: TripDto = {
        id: '1',
        driverId: 'driver1',
        ...tripData,
        seatsFree: 4,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (axios as any)._instance.post.mockResolvedValue({ data: mockCreatedTrip });

      const result = await TripsService.createTrip(tripData);

      expect((axios as any)._instance.post).toHaveBeenCalledWith('/trips', tripData);
      expect(result).toEqual(mockCreatedTrip);
    });
  });

  describe('updateTrip', () => {
    it('should update an existing trip', async () => {
      const updateData = { seatsTotal: 5 };
      const mockUpdatedTrip: TripDto = {
        id: '1',
        driverId: 'driver1',
        origin: { lat: 40.4168, lng: -3.7038 },
        destinationSedeId: 'SEDE-1',
        dateTime: '2024-01-01T08:00:00Z',
        seatsTotal: 5,
        seatsFree: 2,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      (axios as any)._instance.put.mockResolvedValue({ data: mockUpdatedTrip });

      const result = await TripsService.updateTrip('1', updateData);

      expect((axios as any)._instance.put).toHaveBeenCalledWith('/trips/1', updateData);
      expect(result).toEqual(mockUpdatedTrip);
    });
  });

  describe('deleteTrip', () => {
    it('should delete a trip', async () => {
      (axios as any)._instance.delete.mockResolvedValue({});

      await TripsService.deleteTrip('1');

      expect((axios as any)._instance.delete).toHaveBeenCalledWith('/trips/1');
    });
  });

  describe('getMyTrips', () => {
    it('should fetch user trips', async () => {
      const mockTrips: TripDto[] = [];

      (axios as any)._instance.get.mockResolvedValue({ data: mockTrips });

      const result = await TripsService.getMyTrips();

      expect((axios as any)._instance.get).toHaveBeenCalledWith('/trips/my-trips');
      expect(result).toEqual(mockTrips);
    });
  });
});
