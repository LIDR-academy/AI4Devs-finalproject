import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  UserRole,
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkOrderDto } from './dto/create-work-order.dto';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrdersService', () => {
  let workOrdersService: WorkOrdersService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
    };
    vehicle: {
      findUnique: jest.Mock;
    };
    workOrder: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    workOrderTask: {
      createMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const vehicleId = 'vehicle-1';
  const ownerClientId = 'client-1';
  const createdById = 'admin-1';
  const mechanicId = 'mechanic-1';
  const workOrderId = 'wo-1';

  const vehicleWithOwnership = {
    id: vehicleId,
    ownerships: [{ clientId: ownerClientId }],
  };

  const workOrderDetail = {
    id: workOrderId,
    vehicleId,
    ownerClientId,
    status: WorkOrderStatus.EN_PROCESO,
    entryReason: 'Oil change',
    mileage: 50000,
    assignedMechanicId: null,
    assignedMechanic: null,
    createdById,
    checkedInAt: new Date('2026-06-19T10:00:00.000Z'),
    updatedAt: new Date('2026-06-19T10:00:00.000Z'),
    tasks: [
      {
        id: 'task-1',
        description: 'Change oil',
        status: WorkOrderTaskStatus.PENDING,
        cost: null,
        costNotes: null,
        sortOrder: 0,
        completedAt: null,
      },
    ],
    vehicle: {
      licensePlate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
    },
    ownerClient: {
      fullName: 'Juan Pérez',
      nationalId: '1-2345-6789',
    },
  };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      vehicle: {
        findUnique: jest.fn(),
      },
      workOrder: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      workOrderTask: {
        createMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    workOrdersService = new WorkOrdersService(
      prisma as unknown as PrismaService,
    );
  });

  describe('findActiveMechanics', () => {
    it('returns assignable mechanics and admins with flag', async () => {
      prisma.user.findMany.mockResolvedValue([
        {
          id: 'admin-eligible',
          fullName: 'Working Admin',
          role: UserRole.ADMIN,
        },
        {
          id: mechanicId,
          fullName: 'Workshop Mechanic',
          role: UserRole.MECHANIC,
        },
      ]);

      const result = await workOrdersService.findActiveMechanics();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          active: true,
          OR: [
            { role: UserRole.MECHANIC },
            { role: UserRole.ADMIN, canActAsMechanic: true },
          ],
        },
        select: { id: true, fullName: true, role: true },
        orderBy: { fullName: 'asc' },
      });
      expect(result).toEqual([
        {
          id: 'admin-eligible',
          fullName: 'Working Admin',
          role: UserRole.ADMIN,
        },
        {
          id: mechanicId,
          fullName: 'Workshop Mechanic',
          role: UserRole.MECHANIC,
        },
      ]);
    });
  });

  describe('findActiveByVehicle', () => {
    it('returns active work order when one exists', async () => {
      const activeWorkOrder = {
        id: workOrderId,
        status: WorkOrderStatus.EN_PROCESO,
        checkedInAt: new Date('2026-06-19T10:00:00.000Z'),
      };

      prisma.vehicle.findUnique.mockResolvedValue({ id: vehicleId });
      prisma.workOrder.findFirst.mockResolvedValue(activeWorkOrder);

      const result = await workOrdersService.findActiveByVehicle(vehicleId);

      expect(result).toEqual({ activeWorkOrder });
    });

    it('returns null when no active work order exists', async () => {
      prisma.vehicle.findUnique.mockResolvedValue({ id: vehicleId });
      prisma.workOrder.findFirst.mockResolvedValue(null);

      const result = await workOrdersService.findActiveByVehicle(vehicleId);

      expect(result).toEqual({ activeWorkOrder: null });
    });

    it('throws NotFoundException for unknown vehicle', async () => {
      prisma.vehicle.findUnique.mockResolvedValue(null);

      await expect(
        workOrdersService.findActiveByVehicle(vehicleId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findById', () => {
    it('returns work order detail with tasks', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(workOrderDetail);

      const result = await workOrdersService.findById(workOrderId);

      expect(result.id).toBe(workOrderId);
      expect(result.tasks).toHaveLength(1);
      expect(result.totalAmount).toBe(0);
      expect(result.vehicle.licensePlate).toBe('ABC123');
      expect(result.owner.fullName).toBe('Juan Pérez');
    });

    it('throws NotFoundException for unknown id', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        workOrdersService.findById('00000000-0000-4000-8000-000000000099'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('create', () => {
    const baseDto: CreateWorkOrderDto = {
      vehicleId,
      entryReason: 'Oil change service',
      mileage: 50000,
      initialTasks: [{ description: 'Change oil' }],
    };

    function mockSuccessfulTransaction(
      options: {
        assignedMechanicId?: string;
        initialTasks?: CreateWorkOrderDto['initialTasks'];
        existingActive?: { id: string } | null;
      } = {},
    ): void {
      const {
        assignedMechanicId,
        initialTasks = baseDto.initialTasks,
        existingActive = null,
      } = options;

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(vehicleWithOwnership),
          },
          workOrder: {
            findFirst: jest.fn().mockResolvedValue(existingActive),
            create: jest.fn().mockResolvedValue({
              id: workOrderId,
              vehicleId,
              ownerClientId,
              status: WorkOrderStatus.EN_PROCESO,
              entryReason: baseDto.entryReason,
              mileage: baseDto.mileage,
              assignedMechanicId: assignedMechanicId ?? null,
              createdById,
            }),
          },
          workOrderTask: {
            createMany: jest.fn().mockResolvedValue({ count: initialTasks.length }),
          },
          user: {
            findFirst: jest
              .fn()
              .mockResolvedValue(
                assignedMechanicId ? { id: assignedMechanicId } : null,
              ),
          },
        }),
      );

      prisma.workOrder.findUnique.mockResolvedValue({
        ...workOrderDetail,
        assignedMechanicId: assignedMechanicId ?? null,
        tasks: initialTasks.map((task, index) => ({
          id: `task-${index}`,
          description: task.description,
          status: WorkOrderTaskStatus.PENDING,
          cost: null,
          costNotes: null,
          sortOrder: index,
          completedAt: null,
        })),
      });
    }

    it('creates work order with pending tasks and owner snapshot', async () => {
      mockSuccessfulTransaction();

      const result = await workOrdersService.create(baseDto, createdById);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.status).toBe(WorkOrderStatus.EN_PROCESO);
      expect(result.ownerClientId).toBe(ownerClientId);
      expect(result.createdById).toBe(createdById);
      expect(result.tasks[0].status).toBe(WorkOrderTaskStatus.PENDING);
    });

    it('persists null mileage when mileage is omitted', async () => {
      let capturedMileage: number | null | undefined;

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(vehicleWithOwnership),
          },
          workOrder: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockImplementation(({ data }) => {
              capturedMileage = data.mileage;
              return { id: workOrderId };
            }),
          },
          workOrderTask: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          user: { findFirst: jest.fn() },
        }),
      );

      prisma.workOrder.findUnique.mockResolvedValue({
        ...workOrderDetail,
        mileage: null,
      });

      const dto: CreateWorkOrderDto = {
        vehicleId,
        entryReason: 'Vehicle towed in without odometer',
        initialTasks: [{ description: 'Diagnose no-start' }],
      };

      const result = await workOrdersService.create(dto, createdById);

      expect(capturedMileage).toBeNull();
      expect(result.mileage).toBeNull();
    });

    it('creates multiple tasks with correct sortOrder', async () => {
      const dto: CreateWorkOrderDto = {
        ...baseDto,
        initialTasks: [
          { description: 'Inspect brakes' },
          { description: 'Replace pads' },
        ],
      };

      let capturedTaskData: Array<{ sortOrder: number }> = [];

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(vehicleWithOwnership),
          },
          workOrder: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({ id: workOrderId }),
          },
          workOrderTask: {
            createMany: jest.fn().mockImplementation(({ data }) => {
              capturedTaskData = data;
              return { count: data.length };
            }),
          },
          user: { findFirst: jest.fn() },
        }),
      );

      prisma.workOrder.findUnique.mockResolvedValue(workOrderDetail);

      await workOrdersService.create(dto, createdById);

      expect(capturedTaskData.map((task) => task.sortOrder)).toEqual([0, 1]);
    });

    it('links assigned mechanic when provided', async () => {
      const dto: CreateWorkOrderDto = {
        ...baseDto,
        assignedMechanicId: mechanicId,
      };

      mockSuccessfulTransaction({ assignedMechanicId: mechanicId });

      const result = await workOrdersService.create(dto, createdById);

      expect(result.assignedMechanicId).toBe(mechanicId);
    });

    it('throws BadRequestException for invalid mechanic', async () => {
      const dto: CreateWorkOrderDto = {
        ...baseDto,
        assignedMechanicId: 'admin-1',
      };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          vehicle: {
            findUnique: jest.fn().mockResolvedValue(vehicleWithOwnership),
          },
          workOrder: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn(),
          },
          workOrderTask: { createMany: jest.fn() },
          user: { findFirst: jest.fn().mockResolvedValue(null) },
        }),
      );

      await expect(
        workOrdersService.create(dto, createdById),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('links admin with canActAsMechanic when provided', async () => {
      const adminEligibleId = 'admin-eligible';
      const dto: CreateWorkOrderDto = {
        ...baseDto,
        assignedMechanicId: adminEligibleId,
      };

      mockSuccessfulTransaction({ assignedMechanicId: adminEligibleId });

      const result = await workOrdersService.create(dto, createdById);

      expect(result.assignedMechanicId).toBe(adminEligibleId);
    });

    it('throws NotFoundException for unknown vehicle', async () => {
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          vehicle: { findUnique: jest.fn().mockResolvedValue(null) },
          workOrder: { findFirst: jest.fn(), create: jest.fn() },
          workOrderTask: { createMany: jest.fn() },
          user: { findFirst: jest.fn() },
        }),
      );

      await expect(
        workOrdersService.create(baseDto, createdById),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException when vehicle has no active owner', async () => {
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          vehicle: {
            findUnique: jest.fn().mockResolvedValue({
              id: vehicleId,
              ownerships: [],
            }),
          },
          workOrder: { findFirst: jest.fn(), create: jest.fn() },
          workOrderTask: { createMany: jest.fn() },
          user: { findFirst: jest.fn() },
        }),
      );

      await expect(
        workOrdersService.create(baseDto, createdById),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws ConflictException with activeWorkOrderId for duplicate active WO', async () => {
      mockSuccessfulTransaction({
        existingActive: { id: 'existing-wo' },
      });

      await expect(
        workOrdersService.create(baseDto, createdById),
      ).rejects.toMatchObject({
        response: {
          message: 'Vehicle already has an active work order',
          activeWorkOrderId: 'existing-wo',
        },
      });
      await expect(
        workOrdersService.create(baseDto, createdById),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('updateMileage', () => {
    it('updates mileage on EN_PROCESO work order', async () => {
      const updatedAt = new Date('2026-07-15T12:00:00.000Z');

      prisma.workOrder.findUnique.mockResolvedValue({
        id: workOrderId,
        status: WorkOrderStatus.EN_PROCESO,
      });
      prisma.workOrder.update.mockResolvedValue({
        id: workOrderId,
        mileage: 85400,
        updatedAt,
      });

      const result = await workOrdersService.updateMileage(
        workOrderId,
        { mileage: 85400 },
        { userId: createdById, role: UserRole.MECHANIC },
      );

      expect(result).toEqual({
        id: workOrderId,
        mileage: 85400,
        updatedAt,
      });
    });

    it('allows admin to update mileage on ENTREGADA work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: workOrderId,
        status: WorkOrderStatus.ENTREGADA,
      });
      prisma.workOrder.update.mockResolvedValue({
        id: workOrderId,
        mileage: 90000,
        updatedAt: new Date(),
      });

      await workOrdersService.updateMileage(
        workOrderId,
        { mileage: 90000 },
        { userId: createdById, role: UserRole.ADMIN },
      );

      expect(prisma.workOrder.update).toHaveBeenCalled();
    });

    it('forbids mechanic from updating mileage on ENTREGADA work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: workOrderId,
        status: WorkOrderStatus.ENTREGADA,
      });

      await expect(
        workOrdersService.updateMileage(
          workOrderId,
          { mileage: 90000 },
          { userId: createdById, role: UserRole.MECHANIC },
        ),
      ).rejects.toMatchObject({
        response: {
          message:
            'Only administrators can update mileage on delivered work orders',
        },
      });
    });

    it('clears mileage to null', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        id: workOrderId,
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
      });
      prisma.workOrder.update.mockResolvedValue({
        id: workOrderId,
        mileage: null,
        updatedAt: new Date(),
      });

      const result = await workOrdersService.updateMileage(
        workOrderId,
        { mileage: null },
        { userId: createdById, role: UserRole.ADMIN },
      );

      expect(result.mileage).toBeNull();
    });

    it('throws NotFoundException for unknown work order', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        workOrdersService.updateMileage(
          workOrderId,
          { mileage: 1000 },
          { userId: createdById, role: UserRole.ADMIN },
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
