import { NotFoundException } from '@nestjs/common';
import {
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
  let service: HistoryService;
  let prisma: {
    vehicle: { findUnique: jest.Mock };
    client: { findUnique: jest.Mock };
    vehicleOwnership: { findMany: jest.Mock };
  };

  const checkedInAt = new Date('2026-06-19T10:00:00.000Z');
  const olderCheckedInAt = new Date('2026-06-18T10:00:00.000Z');
  const deliveredAt = new Date('2026-06-20T15:00:00.000Z');

  const juanClient = {
    id: 'client-juan',
    fullName: 'Juan Pérez',
    nationalId: '1-2345-6789',
    phone: '88887777',
    email: 'juan@email.com',
    createdAt: checkedInAt,
    updatedAt: checkedInAt,
  };

  const mariaClient = {
    id: 'client-maria',
    fullName: 'María López',
    nationalId: '2-3456-7890',
    phone: '77776666',
    email: null,
    createdAt: checkedInAt,
    updatedAt: checkedInAt,
  };

  const vehicle = {
    id: 'vehicle-1',
    licensePlate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Blanco',
    excludeFromReminders: false,
    excludedAt: null,
    excludedById: null,
    lastReminderSentAt: null,
    createdAt: checkedInAt,
    updatedAt: checkedInAt,
    ownerships: [
      {
        id: 'ownership-1',
        vehicleId: 'vehicle-1',
        clientId: mariaClient.id,
        validFrom: checkedInAt,
        validTo: null,
        client: mariaClient,
      },
    ],
    workOrders: [
      {
        id: 'wo-active',
        vehicleId: 'vehicle-1',
        ownerClientId: juanClient.id,
        status: WorkOrderStatus.EN_PROCESO,
        entryReason: 'Oil change',
        mileage: 46000,
        assignedMechanicId: null,
        createdById: 'user-1',
        checkedInAt,
        deliveredAt: null,
        ownerContactedAt: null,
        ownerContactedById: null,
        visitDiagnosis: null,
        visitRepairSummary: null,
        visitPartsUsed: null,
        visitAdditionalNotes: null,
        createdAt: checkedInAt,
        updatedAt: checkedInAt,
        ownerClient: juanClient,
        tasks: [
          {
            id: 'task-2',
            workOrderId: 'wo-active',
            description: 'Oil change',
            status: WorkOrderTaskStatus.PENDING,
            cost: null,
            costNotes: null,
            diagnosis: null,
            repairPerformed: null,
            partsUsed: null,
            additionalNotes: null,
            sortOrder: 0,
            completedAt: null,
            createdAt: checkedInAt,
            updatedAt: checkedInAt,
          },
        ],
      },
      {
        id: 'wo-delivered',
        vehicleId: 'vehicle-1',
        ownerClientId: juanClient.id,
        status: WorkOrderStatus.ENTREGADA,
        entryReason: 'Brake service',
        mileage: 45000,
        assignedMechanicId: null,
        createdById: 'user-1',
        checkedInAt: olderCheckedInAt,
        deliveredAt,
        ownerContactedAt: null,
        ownerContactedById: null,
        visitDiagnosis: 'Worn pads',
        visitRepairSummary: 'Pads replaced',
        visitPartsUsed: 'Front pads',
        visitAdditionalNotes: null,
        createdAt: olderCheckedInAt,
        updatedAt: deliveredAt,
        ownerClient: juanClient,
        tasks: [
          {
            id: 'task-1',
            workOrderId: 'wo-delivered',
            description: 'Replace pads',
            status: WorkOrderTaskStatus.COMPLETED,
            cost: 50,
            costNotes: 'Labor included',
            diagnosis: 'Pad wear',
            repairPerformed: 'Pads replaced',
            partsUsed: 'OEM pads',
            additionalNotes: null,
            sortOrder: 0,
            completedAt: deliveredAt,
            createdAt: olderCheckedInAt,
            updatedAt: deliveredAt,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    prisma = {
      vehicle: { findUnique: jest.fn() },
      client: { findUnique: jest.fn() },
      vehicleOwnership: { findMany: jest.fn() },
    };

    service = new HistoryService(prisma as unknown as PrismaService);
  });

  describe('getVehicleHistory', () => {
    it('returns visits ordered by checkedInAt DESC', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.getVehicleHistory('vehicle-1');

      expect(result.visits).toHaveLength(2);
      expect(result.visits[0].workOrderId).toBe('wo-active');
      expect(result.visits[1].workOrderId).toBe('wo-delivered');
    });

    it('includes all statuses with Spanish statusLabel', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.getVehicleHistory('vehicle-1');

      expect(result.visits[0]).toEqual(
        expect.objectContaining({
          status: WorkOrderStatus.EN_PROCESO,
          statusLabel: 'En proceso',
        }),
      );
      expect(result.visits[1]).toEqual(
        expect.objectContaining({
          status: WorkOrderStatus.ENTREGADA,
          statusLabel: 'Entregada',
          deliveredAt,
        }),
      );
    });

    it('preserves ownerAtVisit snapshot when current owner differs (D3)', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.getVehicleHistory('vehicle-1');

      expect(result.currentOwner?.id).toBe(mariaClient.id);
      expect(result.visits[0].ownerAtVisit).toEqual({
        id: juanClient.id,
        fullName: juanClient.fullName,
        nationalId: juanClient.nationalId,
      });
    });

    it('maps tasks, technical notes, and visit notes', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.getVehicleHistory('vehicle-1');
      const deliveredVisit = result.visits.find(
        (visit) => visit.workOrderId === 'wo-delivered',
      );

      expect(deliveredVisit?.visitNotes).toEqual({
        visitDiagnosis: 'Worn pads',
        visitRepairSummary: 'Pads replaced',
        visitPartsUsed: 'Front pads',
        visitAdditionalNotes: null,
      });
      expect(deliveredVisit?.tasks[0]).toEqual(
        expect.objectContaining({
          id: 'task-1',
          diagnosis: 'Pad wear',
          costNotes: 'Labor included',
        }),
      );
    });

    it('calculates totalAmount from completed task costs only', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.getVehicleHistory('vehicle-1');

      expect(result.visits.find((v) => v.workOrderId === 'wo-delivered')?.totalAmount).toBe(50);
      expect(result.visits.find((v) => v.workOrderId === 'wo-active')?.totalAmount).toBe(0);
    });

    it('returns empty visits and total 0 when no work orders', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({
        ...vehicle,
        workOrders: [],
      });

      const result = await service.getVehicleHistory('vehicle-1');

      expect(result.visits).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('throws NotFoundException for unknown vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        service.getVehicleHistory('00000000-0000-4000-8000-000000000099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns vehicle metadata and currentOwner', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(vehicle);

      const result = await service.getVehicleHistory('vehicle-1');

      expect(result).toEqual(
        expect.objectContaining({
          vehicleId: 'vehicle-1',
          licensePlate: 'ABC123',
          vehicleLabel: 'Toyota Corolla 2020',
          total: 2,
        }),
      );
      expect(result.currentOwner?.id).toBe(mariaClient.id);
    });
  });

  describe('getClientProfile', () => {
    it('returns client with active vehicles sorted by license plate', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.vehicleOwnership.findMany.mockResolvedValue([
        {
          vehicle: {
            id: 'vehicle-2',
            licensePlate: 'XYZ999',
            brand: 'Honda',
            model: 'Civic',
            year: 2019,
            workOrders: [
              {
                checkedInAt,
                status: WorkOrderStatus.EN_PROCESO,
              },
            ],
          },
        },
        {
          vehicle: {
            id: 'vehicle-1',
            licensePlate: 'ABC123',
            brand: 'Toyota',
            model: 'Corolla',
            year: 2020,
            workOrders: [
              {
                checkedInAt: olderCheckedInAt,
                status: WorkOrderStatus.ENTREGADA,
              },
            ],
          },
        },
      ]);

      const result = await service.getClientProfile('client-juan');

      expect(result.vehicles).toHaveLength(2);
      expect(result.vehicles[0].licensePlate).toBe('XYZ999');
      expect(result.vehicles[1].licensePlate).toBe('ABC123');
      expect(result.vehicles[0].lastVisitAt).toEqual(checkedInAt);
      expect(result.vehicles[0].lastVisitStatus).toBe(WorkOrderStatus.EN_PROCESO);
    });

    it('returns empty vehicles array when client has no active vehicles', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.vehicleOwnership.findMany.mockResolvedValue([]);

      const result = await service.getClientProfile('client-juan');

      expect(result.vehicles).toEqual([]);
    });

    it('throws NotFoundException for unknown client', async () => {
      prisma.client.findUnique.mockResolvedValue(null);

      await expect(
        service.getClientProfile('00000000-0000-4000-8000-000000000099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('excludes sold vehicles (ended ownership)', async () => {
      prisma.client.findUnique.mockResolvedValue(juanClient);
      prisma.vehicleOwnership.findMany.mockResolvedValue([]);

      const result = await service.getClientProfile('client-juan');

      expect(result.vehicles).toEqual([]);
      expect(prisma.vehicleOwnership.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clientId: 'client-juan', validTo: null },
        }),
      );
    });
  });
});
