import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MaintenanceReminderEmailService } from '../notifications/maintenance-reminder-email.service';
import { ACTIVE_WORK_ORDER_STATUSES } from '../work-orders/constants/work-order-status';
import { RemindersService } from './reminders.service';

describe('RemindersService', () => {
  let service: RemindersService;
  let prisma: {
    workOrder: {
      groupBy: jest.Mock;
      findMany: jest.Mock;
    };
    vehicle: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };
  let emailService: { send: jest.Mock };

  const vehicleId = '11111111-1111-4111-8111-111111111111';
  const clientId = '22222222-2222-4222-8222-222222222222';
  const actorId = '33333333-3333-4333-8333-333333333333';

  const oldDeliveredAt = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
  const recentDeliveredAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

  function vehicleRow(overrides?: {
    excludeFromReminders?: boolean;
    email?: string | null;
    ownerships?: unknown[];
  }) {
    return {
      id: vehicleId,
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2018,
      excludeFromReminders: overrides?.excludeFromReminders ?? false,
      lastReminderSentAt: null,
      ownerships:
        overrides?.ownerships ??
        [
          {
            client: {
              id: clientId,
              fullName: 'Juan Pérez',
              email:
                overrides?.email === undefined
                  ? 'juan@email.com'
                  : overrides.email,
            },
          },
        ],
    };
  }

  beforeEach(async () => {
    prisma = {
      workOrder: {
        groupBy: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      vehicle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    emailService = {
      send: jest.fn().mockResolvedValue({ emailStatus: 'sent', warning: null }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemindersService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) =>
              key === 'REMINDER_INACTIVE_DAYS' ? '180' : undefined,
          },
        },
        {
          provide: MaintenanceReminderEmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    service = module.get(RemindersService);
  });

  describe('listEligible', () => {
    it('includes vehicles with last delivery older than threshold', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: oldDeliveredAt } },
      ]);
      prisma.vehicle.findMany.mockResolvedValue([vehicleRow()]);

      const result = await service.listEligible({ limit: 50, offset: 0 });

      expect(result.total).toBe(1);
      expect(result.items[0]?.licensePlate).toBe('ABC123');
      expect(result.items[0]?.canEmail).toBe(true);
      expect(result.items[0]?.daysSinceVisit).toBeGreaterThanOrEqual(180);
      expect(result.thresholdDays).toBe(180);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('excludes vehicles delivered within threshold', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: recentDeliveredAt } },
      ]);

      const result = await service.listEligible({});

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(prisma.vehicle.findMany).not.toHaveBeenCalled();
    });

    it('excludes opted-out vehicles via query filter', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: oldDeliveredAt } },
      ]);
      prisma.vehicle.findMany.mockResolvedValue([]);

      const result = await service.listEligible({});
      expect(result.total).toBe(0);
      expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ excludeFromReminders: false }),
        }),
      );
    });

    it('excludes vehicles with an active work order', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: oldDeliveredAt } },
      ]);
      prisma.workOrder.findMany.mockResolvedValue([{ vehicleId }]);

      const result = await service.listEligible({});
      expect(result.total).toBe(0);
      expect(prisma.workOrder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ACTIVE_WORK_ORDER_STATUSES },
          }),
        }),
      );
    });

    it('excludes vehicles without active ownership', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: oldDeliveredAt } },
      ]);
      prisma.vehicle.findMany.mockResolvedValue([
        vehicleRow({ ownerships: [] }),
      ]);

      const result = await service.listEligible({});
      expect(result.total).toBe(0);
    });

    it('lists vehicles without email with canEmail false', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: oldDeliveredAt } },
      ]);
      prisma.vehicle.findMany.mockResolvedValue([
        vehicleRow({ email: null }),
      ]);

      const result = await service.listEligible({});
      expect(result.items[0]?.canEmail).toBe(false);
      expect(result.items[0]?.ownerEmail).toBeNull();
    });

    it('paginates with limit and offset and echoes values', async () => {
      const id2 = '44444444-4444-4444-8444-444444444444';
      const older = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000);
      const newer = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);

      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: newer } },
        { vehicleId: id2, _max: { deliveredAt: older } },
      ]);
      prisma.vehicle.findMany.mockResolvedValue([
        vehicleRow(),
        {
          ...vehicleRow(),
          id: id2,
          licensePlate: 'XYZ999',
        },
      ]);

      const result = await service.listEligible({ limit: 1, offset: 0 });
      expect(result.total).toBe(2);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.licensePlate).toBe('XYZ999');
      expect(result.limit).toBe(1);
      expect(result.offset).toBe(0);
    });
  });

  describe('optOut / optIn', () => {
    it('sets opt-out flags', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({
        id: vehicleId,
        excludeFromReminders: false,
      });
      prisma.vehicle.update.mockResolvedValue({});

      const result = await service.optOut(vehicleId, actorId);
      expect(result.excludeFromReminders).toBe(true);
      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            excludeFromReminders: true,
            excludedById: actorId,
          }),
        }),
      );
    });

    it('is idempotent when already opted out', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({
        id: vehicleId,
        excludeFromReminders: true,
      });

      const result = await service.optOut(vehicleId, actorId);
      expect(result.excludeFromReminders).toBe(true);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });

    it('clears flags on opt-in', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({ id: vehicleId });
      prisma.vehicle.update.mockResolvedValue({});

      const result = await service.optIn(vehicleId);
      expect(result.excludeFromReminders).toBe(false);
      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            excludeFromReminders: false,
            excludedAt: null,
            excludedById: null,
          },
        }),
      );
    });

    it('throws NotFound when vehicle missing', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);
      await expect(service.optOut(vehicleId, actorId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('sendReminders', () => {
    beforeEach(() => {
      prisma.workOrder.groupBy.mockResolvedValue([
        { vehicleId, _max: { deliveredAt: oldDeliveredAt } },
      ]);
      prisma.workOrder.findMany.mockResolvedValue([]);
      prisma.vehicle.findMany.mockResolvedValue([vehicleRow()]);
      prisma.vehicle.findUnique.mockResolvedValue({
        brand: 'Toyota',
        model: 'Corolla',
        year: 2018,
        licensePlate: 'ABC123',
      });
      prisma.vehicle.update.mockResolvedValue({});
    });

    it('sends and updates lastReminderSentAt only on sent', async () => {
      const result = await service.sendReminders(
        { vehicleIds: [vehicleId] },
        { userId: actorId, email: 'admin@taller.com' },
      );

      expect(result.summary.sent).toBe(1);
      expect(result.results[0]?.emailStatus).toBe('sent');
      expect(prisma.vehicle.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { lastReminderSentAt: expect.any(Date) },
        }),
      );
    });

    it('skips not eligible ids without failing the batch', async () => {
      const unknownId = '55555555-5555-4555-8555-555555555555';
      prisma.vehicle.findUnique.mockResolvedValueOnce({
        licensePlate: 'UNK001',
      });

      const result = await service.sendReminders(
        { vehicleIds: [unknownId] },
        { userId: actorId, email: 'admin@taller.com' },
      );

      expect(result.results[0]?.emailStatus).toBe('skipped_not_eligible');
      expect(result.summary.skipped).toBe(1);
      expect(emailService.send).not.toHaveBeenCalled();
    });

    it('does not update lastReminderSentAt on failed send', async () => {
      emailService.send.mockResolvedValue({
        emailStatus: 'failed',
        warning: 'Failed to send email; you can retry',
      });

      const result = await service.sendReminders(
        { vehicleIds: [vehicleId] },
        { userId: actorId, email: 'admin@taller.com' },
      );

      expect(result.summary.failed).toBe(1);
      expect(prisma.vehicle.update).not.toHaveBeenCalled();
    });
  });

  describe('groupBy uses ENTREGADA', () => {
    it('queries delivered work orders only', async () => {
      prisma.workOrder.groupBy.mockResolvedValue([]);
      await service.listEligible({});
      expect(prisma.workOrder.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: WorkOrderStatus.ENTREGADA,
            deliveredAt: { not: null },
          },
        }),
      );
    });
  });
});
