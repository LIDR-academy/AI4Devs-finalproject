import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkOrderTasksService } from './work-order-tasks.service';

describe('WorkOrderTasksService', () => {
  let service: WorkOrderTasksService;
  let prisma: {
    workOrder: {
      findUnique: jest.Mock;
      update: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    workOrderTask: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const workOrderId = 'wo-1';
  const taskId = 'task-1';
  const taskId2 = 'task-2';

  const pendingTask = {
    id: taskId,
    workOrderId,
    description: 'Oil change',
    status: WorkOrderTaskStatus.PENDING,
    cost: null,
    costNotes: null,
    sortOrder: 0,
    completedAt: null,
    createdAt: new Date('2026-06-19T10:00:00.000Z'),
    updatedAt: new Date('2026-06-19T10:00:00.000Z'),
  };

  const inProgressTask = {
    ...pendingTask,
    id: taskId2,
    description: 'Brake check',
    status: WorkOrderTaskStatus.IN_PROGRESS,
    sortOrder: 1,
  };

  const editableWorkOrder = {
    id: workOrderId,
    status: WorkOrderStatus.EN_PROCESO,
    updatedAt: new Date('2026-06-19T10:00:00.000Z'),
    tasks: [pendingTask, inProgressTask],
  };

  beforeEach(() => {
    prisma = {
      workOrder: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      workOrderTask: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    service = new WorkOrderTasksService(prisma as unknown as PrismaService);
  });

  describe('addTask', () => {
    const dto: CreateTaskDto = { description: 'New task item' };

    it('creates pending task with incremented sortOrder', async () => {
      const createdTask = {
        ...pendingTask,
        id: 'task-3',
        description: 'New task item',
        sortOrder: 2,
      };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue(editableWorkOrder),
          },
          workOrderTask: {
            create: jest.fn().mockResolvedValue(createdTask),
          },
        }),
      );

      const result = await service.addTask(workOrderId, dto);

      expect(result.status).toBe(WorkOrderTaskStatus.PENDING);
      expect(result.sortOrder).toBe(2);
    });

    it('throws ForbiddenException when work order is LISTA_PARA_ENTREGA', async () => {
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              status: WorkOrderStatus.LISTA_PARA_ENTREGA,
            }),
          },
          workOrderTask: { create: jest.fn() },
        }),
      );

      await expect(service.addTask(workOrderId, dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when work order is ENTREGADA', async () => {
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              status: WorkOrderStatus.ENTREGADA,
            }),
          },
          workOrderTask: { create: jest.fn() },
        }),
      );

      await expect(service.addTask(workOrderId, dto)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('throws NotFoundException for unknown work order', async () => {
      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: { findUnique: jest.fn().mockResolvedValue(null) },
          workOrderTask: { create: jest.fn() },
        }),
      );

      await expect(service.addTask(workOrderId, dto)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('updateTask', () => {
    it('updates task to IN_PROGRESS without changing work order status', async () => {
      const dto: UpdateTaskDto = { status: WorkOrderTaskStatus.IN_PROGRESS };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue(editableWorkOrder),
            update: jest.fn(),
            findUniqueOrThrow: jest.fn().mockResolvedValue(editableWorkOrder),
          },
          workOrderTask: {
            update: jest.fn().mockResolvedValue({
              ...pendingTask,
              status: WorkOrderTaskStatus.IN_PROGRESS,
            }),
            findMany: jest.fn().mockResolvedValue([
              { ...pendingTask, status: WorkOrderTaskStatus.IN_PROGRESS },
              inProgressTask,
            ]),
          },
        }),
      );

      const result = await service.updateTask(workOrderId, taskId, dto);

      expect(result.task.status).toBe(WorkOrderTaskStatus.IN_PROGRESS);
      expect(result.workOrder.status).toBe(WorkOrderStatus.EN_PROCESO);
      expect(result.workOrder.totalAmount).toBe(0);
    });

    it('completes task with cost and sets completedAt', async () => {
      const dto: UpdateTaskDto = {
        status: WorkOrderTaskStatus.COMPLETED,
        cost: 120.5,
        costNotes: 'Includes parts',
      };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue(editableWorkOrder),
            update: jest.fn(),
            findUniqueOrThrow: jest.fn().mockResolvedValue(editableWorkOrder),
          },
          workOrderTask: {
            update: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
              {
                ...pendingTask,
                status: WorkOrderTaskStatus.COMPLETED,
                cost: 120.5,
                costNotes: 'Includes parts',
                completedAt: new Date('2026-06-19T11:00:00.000Z'),
              },
              inProgressTask,
            ]),
          },
        }),
      );

      const result = await service.updateTask(workOrderId, taskId, dto);

      expect(result.task.status).toBe(WorkOrderTaskStatus.COMPLETED);
      expect(result.task.cost).toBe(120.5);
      expect(result.workOrder.totalAmount).toBe(120.5);
    });

    it('allows PENDING to COMPLETED shortcut with cost', async () => {
      const dto: UpdateTaskDto = {
        status: WorkOrderTaskStatus.COMPLETED,
        cost: 50,
      };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              tasks: [pendingTask],
            }),
            update: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              status: WorkOrderStatus.LISTA_PARA_ENTREGA,
            }),
            findUniqueOrThrow: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              status: WorkOrderStatus.LISTA_PARA_ENTREGA,
            }),
          },
          workOrderTask: {
            update: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
              {
                ...pendingTask,
                status: WorkOrderTaskStatus.COMPLETED,
                cost: 50,
                completedAt: new Date(),
              },
            ]),
          },
        }),
      );

      const result = await service.updateTask(workOrderId, taskId, dto);

      expect(result.workOrder.status).toBe(WorkOrderStatus.LISTA_PARA_ENTREGA);
    });

    it('throws BadRequestException when completing without cost', async () => {
      const dto: UpdateTaskDto = { status: WorkOrderTaskStatus.COMPLETED };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue(editableWorkOrder),
            update: jest.fn(),
            findUniqueOrThrow: jest.fn(),
          },
          workOrderTask: { update: jest.fn(), findMany: jest.fn() },
        }),
      );

      await expect(
        service.updateTask(workOrderId, taskId, dto),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws ConflictException when task already completed', async () => {
      const dto: UpdateTaskDto = {
        status: WorkOrderTaskStatus.IN_PROGRESS,
      };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              tasks: [
                {
                  ...pendingTask,
                  status: WorkOrderTaskStatus.COMPLETED,
                  cost: 10,
                },
              ],
            }),
          },
          workOrderTask: { update: jest.fn(), findMany: jest.fn() },
        }),
      );

      await expect(
        service.updateTask(workOrderId, taskId, dto),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('throws BadRequestException for invalid transition', async () => {
      const dto: UpdateTaskDto = { status: WorkOrderTaskStatus.PENDING };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue(editableWorkOrder),
          },
          workOrderTask: { update: jest.fn(), findMany: jest.fn() },
        }),
      );

      await expect(
        service.updateTask(workOrderId, taskId2, dto),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('transitions work order when all tasks are completed', async () => {
      const dto: UpdateTaskDto = {
        status: WorkOrderTaskStatus.COMPLETED,
        cost: 75,
      };

      prisma.$transaction.mockImplementation(async (callback) =>
        callback({
          workOrder: {
            findUnique: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              tasks: [
                {
                  ...pendingTask,
                  status: WorkOrderTaskStatus.COMPLETED,
                  cost: 25,
                },
                inProgressTask,
              ],
            }),
            update: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              status: WorkOrderStatus.LISTA_PARA_ENTREGA,
            }),
            findUniqueOrThrow: jest.fn().mockResolvedValue({
              ...editableWorkOrder,
              status: WorkOrderStatus.LISTA_PARA_ENTREGA,
              updatedAt: new Date('2026-06-19T12:00:00.000Z'),
            }),
          },
          workOrderTask: {
            update: jest.fn(),
            findMany: jest.fn().mockResolvedValue([
              {
                ...pendingTask,
                status: WorkOrderTaskStatus.COMPLETED,
                cost: 25,
              },
              {
                ...inProgressTask,
                status: WorkOrderTaskStatus.COMPLETED,
                cost: 75,
                completedAt: new Date(),
              },
            ]),
          },
        }),
      );

      const result = await service.updateTask(workOrderId, taskId2, dto);

      expect(result.workOrder.status).toBe(WorkOrderStatus.LISTA_PARA_ENTREGA);
      expect(result.workOrder.totalAmount).toBe(100);
    });
  });
});
