import { ConflictException, NotFoundException } from '@nestjs/common';
import { Client, Prisma, Vehicle, VehicleOwnership } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';
import { normalizeLicensePlate } from './utils/license-plate-normalizer';

describe('VehiclesService', () => {
  let vehiclesService: VehiclesService;
  let prisma: {
    vehicle: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    workOrder: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
    client: {
      findUnique: jest.Mock;
    };
    vehicleOwnership: {
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const ownerClient: Client = {
    id: 'client-1',
    fullName: 'Juan Pérez',
    nationalId: '1-2345-6789',
    phone: '88887777',
    email: 'juan@email.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const vehicle: Vehicle = {
    id: 'vehicle-1',
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2018,
    color: 'Blanco',
    excludeFromReminders: false,
    excludedAt: null,
    excludedById: null,
    lastReminderSentAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const activeOwnership: VehicleOwnership & { client: Client } = {
    id: 'ownership-1',
    vehicleId: 'vehicle-1',
    clientId: 'client-1',
    validFrom: new Date('2026-01-01'),
    validTo: null,
    client: ownerClient,
  };

  const vehicleWithOwnership = {
    ...vehicle,
    ownerships: [activeOwnership],
  };

  beforeEach(() => {
    prisma = {
      vehicle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      workOrder: {
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      client: {
        findUnique: jest.fn(),
      },
      vehicleOwnership: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    vehiclesService = new VehiclesService(prisma as unknown as PrismaService);
  });

  describe('normalizeLicensePlate', () => {
    it('normalizes mixed case and spaces to uppercase without spaces', () => {
      expect(normalizeLicensePlate('abc 123')).toBe('ABC123');
    });
  });

  describe('search', () => {
    it('returns partial plate matches with currentOwner', async () => {
      prisma.vehicle.findMany.mockResolvedValue([vehicleWithOwnership]);

      const result = await vehiclesService.search({ q: 'AB' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].licensePlate).toBe('ABC123');
      expect(result.items[0].currentOwner?.fullName).toBe('Juan Pérez');
    });

    it('returns single result for exact licensePlate search', async () => {
      prisma.vehicle.findUnique
        .mockResolvedValueOnce(vehicle)
        .mockResolvedValueOnce(vehicleWithOwnership);

      const result = await vehiclesService.search({ licensePlate: 'abc123' });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('returns empty array when no matches found', async () => {
      prisma.vehicle.findMany.mockResolvedValue([]);

      const result = await vehiclesService.search({ q: 'ZZ' });

      expect(result).toEqual({ items: [], total: 0 });
    });

    it('returns empty array when q is shorter than 2 characters', async () => {
      const result = await vehiclesService.search({ q: 'A' });

      expect(result).toEqual({ items: [], total: 0 });
      expect(prisma.vehicle.findMany).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const dto: CreateVehicleDto = {
      licensePlate: 'new 999',
      brand: 'Nissan',
      model: 'Sentra',
      year: 2022,
      color: 'Negro',
      clientId: 'client-1',
    };

    it('creates vehicle and ownership in transaction', async () => {
      const createdVehicle = {
        ...vehicle,
        id: 'vehicle-new',
        licensePlate: 'NEW999',
      };

      prisma.vehicle.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...createdVehicle,
          ownerships: [
            {
              ...activeOwnership,
              vehicleId: 'vehicle-new',
            },
          ],
        });

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          client: { findUnique: jest.fn().mockResolvedValue(ownerClient) },
          vehicle: {
            create: jest.fn().mockResolvedValue(createdVehicle),
          },
          vehicleOwnership: {
            create: jest.fn().mockResolvedValue(activeOwnership),
          },
        }),
      );

      const result = await vehiclesService.create(dto);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.licensePlate).toBe('NEW999');
      expect(result.currentOwner?.fullName).toBe('Juan Pérez');
    });

    it('creates vehicle without ownership when clientId is omitted', async () => {
      const createdVehicle = {
        ...vehicle,
        id: 'vehicle-orphan',
        licensePlate: 'ORPHAN1',
      };

      prisma.vehicle.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...createdVehicle,
          ownerships: [],
        });

      const ownershipCreate = jest.fn();
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          client: { findUnique: jest.fn() },
          vehicle: {
            create: jest.fn().mockResolvedValue(createdVehicle),
          },
          vehicleOwnership: {
            create: ownershipCreate,
          },
        }),
      );

      const { clientId: _omit, ...withoutClient } = dto;
      const result = await vehiclesService.create(withoutClient);

      expect(ownershipCreate).not.toHaveBeenCalled();
      expect(result.currentOwner).toBeNull();
      expect(result.licensePlate).toBe('ORPHAN1');
    });

    it('throws NotFoundException when client does not exist', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          client: { findUnique: jest.fn().mockResolvedValue(null) },
          vehicle: { create: jest.fn() },
          vehicleOwnership: { create: jest.fn() },
        }),
      );

      await expect(vehiclesService.create(dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws conflict with existingVehicle for duplicate plate', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      await expect(vehiclesService.create(dto)).rejects.toMatchObject({
        response: {
          message: 'Vehicle with this license plate already exists',
          existingVehicle: expect.objectContaining({
            licensePlate: 'ABC123',
          }),
        },
      });
    });

    it('handles Prisma P2002 race with conflict response', async () => {
      prisma.vehicle.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(vehicle);
      prisma.$transaction.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique constraint', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      );

      await expect(vehiclesService.create(dto)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });
  });

  describe('findById', () => {
    it('returns vehicle DTO with currentOwner', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicleWithOwnership);

      const result = await vehiclesService.findById('vehicle-1');

      expect(result.id).toBe('vehicle-1');
      expect(result.currentOwner?.nationalId).toBe('1-2345-6789');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        vehiclesService.findById('00000000-0000-4000-8000-000000000099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    const dto: UpdateVehicleDto = {
      licensePlate: 'XYZ999',
      brand: 'Honda',
      model: 'Fit',
      year: 2021,
      color: 'Rojo',
    };

    it('updates vehicle and returns DTO with currentOwner', async () => {
      prisma.vehicle.findUnique
        .mockResolvedValueOnce(vehicle)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...vehicle,
          licensePlate: 'XYZ999',
          ownerships: [activeOwnership],
        });
      prisma.vehicle.update.mockResolvedValue({
        ...vehicle,
        licensePlate: 'XYZ999',
      });

      const result = await vehiclesService.update('vehicle-1', dto);

      expect(prisma.vehicle.update).toHaveBeenCalledWith({
        where: { id: 'vehicle-1' },
        data: {
          licensePlate: 'XYZ999',
          brand: 'Honda',
          model: 'Fit',
          year: 2021,
          color: 'Rojo',
        },
      });
      expect(result.licensePlate).toBe('XYZ999');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        vehiclesService.update('00000000-0000-4000-8000-000000000099', dto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws conflict when plate belongs to another vehicle', async () => {
      prisma.vehicle.findUnique
        .mockResolvedValueOnce(vehicle)
        .mockResolvedValueOnce({ ...vehicle, id: 'vehicle-2' });

      await expect(
        vehiclesService.update('vehicle-1', dto),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('delete', () => {
    it('deletes vehicle and ownership records', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({ id: 'vehicle-1' });
      prisma.$transaction.mockResolvedValue([]);

      await vehiclesService.delete('vehicle-1');

      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        vehiclesService.delete('00000000-0000-4000-8000-000000000099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
