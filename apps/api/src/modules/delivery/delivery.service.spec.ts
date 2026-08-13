import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryService } from './delivery.service';

describe('DeliveryService', () => {
  let service: DeliveryService;
  let prisma: {
    workOrder: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  const checkedInAt = new Date('2026-06-19T10:00:00.000Z');
  const olderCheckedInAt = new Date('2026-06-18T10:00:00.000Z');

  const readyWorkOrder = {
    id: 'wo-ready-1',
    vehicleId: 'vehicle-1',
    ownerClientId: 'client-1',
    status: WorkOrderStatus.LISTA_PARA_ENTREGA,
    entryReason: 'Brake service',
    mileage: 45000,
    assignedMechanicId: null,
    createdById: 'user-1',
    checkedInAt,
    deliveredAt: null,
    ownerContactedAt: null,
    ownerContactedById: null,
    ownerContactedBy: null,
    broughtByName: null,
    broughtByPhone: null,
    visitDiagnosis: null,
    visitRepairSummary: null,
    visitPartsUsed: null,
    visitAdditionalNotes: null,
    createdAt: checkedInAt,
    updatedAt: checkedInAt,
    vehicle: {
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
    },
    ownerClient: {
      id: 'client-1',
      fullName: 'Juan Pérez',
      nationalId: '1-2345-6789',
      phone: '88887777',
      email: 'juan@email.com',
      createdAt: checkedInAt,
      updatedAt: checkedInAt,
    },
    tasks: [
      {
        id: 'task-1',
        workOrderId: 'wo-ready-1',
        description: 'Replace pads',
        status: WorkOrderTaskStatus.COMPLETED,
        cost: 50,
        costNotes: null,
        diagnosis: null,
        repairPerformed: null,
        partsUsed: null,
        additionalNotes: null,
        sortOrder: 0,
        completedAt: checkedInAt,
        createdAt: checkedInAt,
        updatedAt: checkedInAt,
      },
      {
        id: 'task-2',
        workOrderId: 'wo-ready-1',
        description: 'Inspect rotors',
        status: WorkOrderTaskStatus.COMPLETED,
        cost: 25,
        costNotes: null,
        diagnosis: null,
        repairPerformed: null,
        partsUsed: null,
        additionalNotes: null,
        sortOrder: 1,
        completedAt: checkedInAt,
        createdAt: checkedInAt,
        updatedAt: checkedInAt,
      },
    ],
  };

  const secondReadyWorkOrder = {
    ...readyWorkOrder,
    id: 'wo-ready-2',
    checkedInAt: olderCheckedInAt,
    vehicle: {
      ...readyWorkOrder.vehicle,
      licensePlate: 'XYZ789',
    },
    ownerClient: {
      ...readyWorkOrder.ownerClient,
      fullName: 'María López',
      phone: null,
      email: null,
    },
    tasks: [
      {
        ...readyWorkOrder.tasks[0],
        id: 'task-3',
        workOrderId: 'wo-ready-2',
        cost: 100,
      },
    ],
  };

  beforeEach(() => {
    prisma = {
      workOrder: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new DeliveryService(prisma as unknown as PrismaService);
  });

  describe('listReady', () => {
    it('returns LISTA_PARA_ENTREGA and OWNER_CONTACTED work orders', async () => {
      prisma.workOrder.findMany.mockResolvedValue([
        secondReadyWorkOrder,
        readyWorkOrder,
      ]);

      const result = await service.listReady({});

      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: {
              in: [
                WorkOrderStatus.LISTA_PARA_ENTREGA,
                WorkOrderStatus.OWNER_CONTACTED,
              ],
            },
          },
        }),
      );
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].status).toBe(WorkOrderStatus.LISTA_PARA_ENTREGA);
      expect(result.items[0].ownerContactedAt).toBeNull();
      expect(result.items[0].ownerContactedBy).toBeNull();
    });

    it('includes contact audit for OWNER_CONTACTED items', async () => {
      const contactedAt = new Date('2026-06-19T15:00:00.000Z');
      prisma.workOrder.findMany.mockResolvedValue([
        {
          ...readyWorkOrder,
          status: WorkOrderStatus.OWNER_CONTACTED,
          ownerContactedAt: contactedAt,
          ownerContactedById: 'admin-1',
          ownerContactedBy: { id: 'admin-1', fullName: 'Workshop Admin' },
        },
      ]);

      const result = await service.listReady({});

      expect(result.items[0].status).toBe(WorkOrderStatus.OWNER_CONTACTED);
      expect(result.items[0].ownerContactedAt).toEqual(contactedAt);
      expect(result.items[0].ownerContactedBy).toEqual({
        id: 'admin-1',
        fullName: 'Workshop Admin',
      });
    });

    it('includes ownerPhone from ownerClient snapshot', async () => {
      prisma.workOrder.findMany.mockResolvedValue([readyWorkOrder]);

      const result = await service.listReady({});

      expect(result.items[0].ownerPhone).toBe('88887777');
      expect(result.items[0].ownerPhoneDisplay).toBe('8888-7777');
    });

    it('returns null ownerPhone when client has no phone', async () => {
      prisma.workOrder.findMany.mockResolvedValue([secondReadyWorkOrder]);

      const result = await service.listReady({});

      expect(result.items[0].ownerPhone).toBeNull();
      expect(result.items[0].ownerPhoneDisplay).toBeNull();
    });

    it('maps ownerless work order with broughtBy fields', async () => {
      prisma.workOrder.findMany.mockResolvedValue([
        {
          ...readyWorkOrder,
          ownerClientId: null,
          ownerClient: null,
          broughtByName: 'External Tech',
          broughtByPhone: '88881234',
        },
      ]);

      const result = await service.listReady({});

      expect(result.items[0].ownerName).toBeNull();
      expect(result.items[0].broughtByName).toBe('External Tech');
      expect(result.items[0].broughtByPhone).toBe('88881234');
    });

    it('calculates totalAmount from completed task costs', async () => {
      prisma.workOrder.findMany.mockResolvedValue([readyWorkOrder]);

      const result = await service.listReady({});

      expect(result.items[0].totalAmount).toBe(75);
    });

    it('sorts by checkedInAt ascending by default', async () => {
      prisma.workOrder.findMany.mockResolvedValue([
        readyWorkOrder,
        secondReadyWorkOrder,
      ]);

      const result = await service.listReady({});

      expect(result.items[0].workOrderId).toBe('wo-ready-2');
      expect(result.items[1].workOrderId).toBe('wo-ready-1');
    });

    it('sorts by totalAmount descending when requested', async () => {
      prisma.workOrder.findMany.mockResolvedValue([
        secondReadyWorkOrder,
        readyWorkOrder,
      ]);

      const result = await service.listReady({
        sort: 'totalAmount',
        order: 'desc',
      });

      expect(result.items[0].totalAmount).toBe(100);
      expect(result.items[1].totalAmount).toBe(75);
    });

    it('returns a non-empty elapsedLabel', async () => {
      prisma.workOrder.findMany.mockResolvedValue([readyWorkOrder]);

      const result = await service.listReady({});

      expect(result.items[0].elapsedLabel.length).toBeGreaterThan(0);
    });
  });

  describe('getReadyDetail', () => {
    it('returns full detail for a ready work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(readyWorkOrder);

      const result = await service.getReadyDetail('wo-ready-1');

      expect(result.workOrderId).toBe('wo-ready-1');
      expect(result.tasks).toHaveLength(2);
      expect(result.totalAmount).toBe(75);
      expect(result.vehicle.licensePlate).toBe('ABC123');
      expect(result.owner?.fullName).toBe('Juan Pérez');
    });

    it('returns full detail for OWNER_CONTACTED work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...readyWorkOrder,
        status: WorkOrderStatus.OWNER_CONTACTED,
        ownerContactedAt: new Date('2026-06-19T15:00:00.000Z'),
        ownerContactedBy: { id: 'admin-1', fullName: 'Workshop Admin' },
      });

      const result = await service.getReadyDetail('wo-ready-1');

      expect(result.status).toBe(WorkOrderStatus.OWNER_CONTACTED);
      expect(result.ownerContactedBy?.fullName).toBe('Workshop Admin');
    });

    it('throws NotFoundException when work order is EN_PROCESO', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...readyWorkOrder,
        status: WorkOrderStatus.EN_PROCESO,
      });

      await expect(service.getReadyDetail('wo-ready-1')).rejects.toThrow(
        new NotFoundException('Work order is not ready for delivery'),
      );
    });

    it('throws NotFoundException when work order is missing', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.getReadyDetail('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markContacted', () => {
    it('marks LISTA_PARA_ENTREGA as OWNER_CONTACTED with audit', async () => {
      const contactedAt = new Date('2026-06-19T16:00:00.000Z');
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
        ownerClientId: 'client-1',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.OWNER_CONTACTED,
        ownerContactedAt: contactedAt,
        ownerContactedBy: { id: 'admin-1', fullName: 'Workshop Admin' },
      });

      const result = await service.markContacted('wo-ready-1', 'admin-1');

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-ready-1' },
        data: {
          status: WorkOrderStatus.OWNER_CONTACTED,
          ownerContactedAt: expect.any(Date),
          ownerContactedById: 'admin-1',
        },
        include: {
          ownerContactedBy: {
            select: { id: true, fullName: true },
          },
        },
      });
      expect(result).toEqual({
        workOrderId: 'wo-ready-1',
        status: WorkOrderStatus.OWNER_CONTACTED,
        ownerContactedAt: contactedAt,
        ownerContactedBy: { id: 'admin-1', fullName: 'Workshop Admin' },
      });
    });

    it('rejects contact when work order has no owner', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
        ownerClientId: null,
      });

      await expect(
        service.markContacted('wo-ready-1', 'admin-1'),
      ).rejects.toThrow(
        new ConflictException('Work order has no owner to contact'),
      );
      expect(prisma.workOrder.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException when already OWNER_CONTACTED', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.OWNER_CONTACTED,
      });

      await expect(
        service.markContacted('wo-ready-1', 'admin-1'),
      ).rejects.toThrow(new ConflictException('Owner already contacted'));
      expect(prisma.workOrder.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException when status is EN_PROCESO', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.EN_PROCESO,
      });

      await expect(
        service.markContacted('wo-ready-1', 'admin-1'),
      ).rejects.toThrow(
        new ConflictException('Work order is not ready for contact'),
      );
    });

    it('throws NotFoundException when work order is missing', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.markContacted('missing', 'admin-1'),
      ).rejects.toThrow(new NotFoundException('Work order not found'));
    });
  });

  describe('markDelivered', () => {
    it('marks a ready work order as ENTREGADA with deliveredAt', async () => {
      const deliveredAt = new Date('2026-06-20T12:00:00.000Z');

      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.ENTREGADA,
        deliveredAt,
      });

      const result = await service.markDelivered('wo-ready-1');

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-ready-1' },
        data: expect.objectContaining({
          status: WorkOrderStatus.ENTREGADA,
          deliveredAt: expect.any(Date),
        }),
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          mileage: true,
        },
      });
      expect(result.status).toBe(WorkOrderStatus.ENTREGADA);
      expect(result.deliveredAt).toEqual(deliveredAt);
    });

    it('persists optional mileage when provided on deliver', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
        mileage: null,
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.ENTREGADA,
        deliveredAt: new Date('2026-06-20T12:00:00.000Z'),
        mileage: 125000,
      });

      const result = await service.markDelivered('wo-ready-1', { mileage: 125000 });

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-ready-1' },
        data: expect.objectContaining({
          status: WorkOrderStatus.ENTREGADA,
          mileage: 125000,
        }),
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          mileage: true,
        },
      });
      expect(result.mileage).toBe(125000);
    });

    it('delivers without changing mileage when body is empty', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
        mileage: null,
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.ENTREGADA,
        deliveredAt: new Date('2026-06-20T12:00:00.000Z'),
        mileage: null,
      });

      const result = await service.markDelivered('wo-ready-1', {});

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-ready-1' },
        data: {
          status: WorkOrderStatus.ENTREGADA,
          deliveredAt: expect.any(Date),
        },
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          mileage: true,
        },
      });
      expect(result.mileage).toBeNull();
    });

    it('marks OWNER_CONTACTED work order as ENTREGADA without clearing contact audit', async () => {
      const deliveredAt = new Date('2026-06-20T12:00:00.000Z');

      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.OWNER_CONTACTED,
        ownerContactedAt: new Date('2026-06-19T16:00:00.000Z'),
        ownerContactedById: 'admin-1',
      });
      prisma.workOrder.update.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.ENTREGADA,
        deliveredAt,
        mileage: 45000,
      });

      const result = await service.markDelivered('wo-ready-1');

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: 'wo-ready-1' },
        data: {
          status: WorkOrderStatus.ENTREGADA,
          deliveredAt: expect.any(Date),
        },
        select: {
          id: true,
          status: true,
          deliveredAt: true,
          mileage: true,
        },
      });
      expect(result.status).toBe(WorkOrderStatus.ENTREGADA);
    });

    it('throws ConflictException when work order is EN_PROCESO', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.EN_PROCESO,
      });

      await expect(service.markDelivered('wo-ready-1')).rejects.toThrow(
        new ConflictException('Work order is not ready for delivery'),
      );
    });

    it('throws ConflictException when work order is already ENTREGADA', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: 'wo-ready-1',
        status: WorkOrderStatus.ENTREGADA,
      });

      await expect(service.markDelivered('wo-ready-1')).rejects.toThrow(
        new ConflictException('Work order is already delivered'),
      );
    });

    it('throws NotFoundException when work order is missing', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.markDelivered('missing')).rejects.toThrow(
        new NotFoundException('Work order not found'),
      );
    });
  });
});
