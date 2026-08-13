import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTaskTechnicalNotesDto } from './dto/update-task-technical-notes.dto';
import { UpdateVisitNotesDto } from './dto/update-visit-notes.dto';
import { WorkOrderTechnicalNotesService } from './work-order-technical-notes.service';

describe('WorkOrderTechnicalNotesService', () => {
  let service: WorkOrderTechnicalNotesService;
  let prisma: {
    workOrder: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    workOrderTask: {
      update: jest.Mock;
    };
  };

  const workOrderId = 'wo-1';
  const taskId = 'task-1';

  const pendingTask = {
    id: taskId,
    workOrderId,
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
    createdAt: new Date('2026-06-19T10:00:00.000Z'),
    updatedAt: new Date('2026-06-19T10:00:00.000Z'),
  };

  const inProgressTask = {
    ...pendingTask,
    status: WorkOrderTaskStatus.IN_PROGRESS,
  };

  const completedTask = {
    ...pendingTask,
    status: WorkOrderTaskStatus.COMPLETED,
    cost: 100,
    completedAt: new Date('2026-06-19T11:00:00.000Z'),
  };

  const editableWorkOrder = {
    id: workOrderId,
    status: WorkOrderStatus.EN_PROCESO,
    visitDiagnosis: null,
    visitRepairSummary: null,
    visitPartsUsed: null,
    visitAdditionalNotes: null,
    tasks: [pendingTask],
  };

  beforeEach(() => {
    prisma = {
      workOrder: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      workOrderTask: {
        update: jest.fn(),
      },
    };

    service = new WorkOrderTechnicalNotesService(
      prisma as unknown as PrismaService,
    );
  });

  describe('updateTaskTechnicalNotes', () => {
    const dto: UpdateTaskTechnicalNotesDto = {
      diagnosis: ' Worn pads ',
      repairPerformed: 'Replaced pads',
      partsUsed: 'Pad kit',
      additionalNotes: 'Customer notified',
    };

    it('updates technical notes on PENDING task when WO is EN_PROCESO', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(editableWorkOrder);
      prisma.workOrderTask.update.mockResolvedValue({
        ...pendingTask,
        diagnosis: 'Worn pads',
        repairPerformed: 'Replaced pads',
        partsUsed: 'Pad kit',
        additionalNotes: 'Customer notified',
      });

      const result = await service.updateTaskTechnicalNotes(
        workOrderId,
        taskId,
        dto,
      );

      expect(prisma.workOrderTask.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          diagnosis: 'Worn pads',
          repairPerformed: 'Replaced pads',
          partsUsed: 'Pad kit',
          additionalNotes: 'Customer notified',
        },
      });
      expect(result.diagnosis).toBe('Worn pads');
      expect(result.status).toBe(WorkOrderTaskStatus.PENDING);
    });

    it('updates technical notes on IN_PROGRESS task', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...editableWorkOrder,
        tasks: [inProgressTask],
      });
      prisma.workOrderTask.update.mockResolvedValue({
        ...inProgressTask,
        diagnosis: 'Worn pads',
      });

      const result = await service.updateTaskTechnicalNotes(workOrderId, taskId, {
        diagnosis: 'Worn pads',
      });

      expect(result.status).toBe(WorkOrderTaskStatus.IN_PROGRESS);
    });

    it('throws ForbiddenException when task is COMPLETED', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...editableWorkOrder,
        tasks: [completedTask],
      });

      await expect(
        service.updateTaskTechnicalNotes(workOrderId, taskId, dto),
      ).rejects.toThrow(
        new ForbiddenException(
          'Cannot edit technical notes on a completed task',
        ),
      );
    });

    it('throws ForbiddenException when WO is LISTA_PARA_ENTREGA', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...editableWorkOrder,
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
      });

      await expect(
        service.updateTaskTechnicalNotes(workOrderId, taskId, dto),
      ).rejects.toThrow(new ForbiddenException('Work order is not editable'));
    });

    it('throws ForbiddenException when WO is ENTREGADA', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...editableWorkOrder,
        status: WorkOrderStatus.ENTREGADA,
      });

      await expect(
        service.updateTaskTechnicalNotes(workOrderId, taskId, dto),
      ).rejects.toThrow(new ForbiddenException('Work order is not editable'));
    });

    it('throws NotFoundException when work order is missing', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTaskTechnicalNotes(workOrderId, taskId, dto),
      ).rejects.toThrow(new NotFoundException('Work order not found'));
    });

    it('throws NotFoundException when task is missing', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...editableWorkOrder,
        tasks: [],
      });

      await expect(
        service.updateTaskTechnicalNotes(workOrderId, taskId, dto),
      ).rejects.toThrow(new NotFoundException('Task not found'));
    });

    it('clears fields when null or empty strings are sent', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(editableWorkOrder);
      prisma.workOrderTask.update.mockResolvedValue({
        ...pendingTask,
        diagnosis: null,
        repairPerformed: null,
        partsUsed: null,
        additionalNotes: null,
      });

      await service.updateTaskTechnicalNotes(workOrderId, taskId, {
        diagnosis: null,
        repairPerformed: '',
        partsUsed: '   ',
        additionalNotes: null,
      });

      expect(prisma.workOrderTask.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          diagnosis: null,
          repairPerformed: null,
          partsUsed: null,
          additionalNotes: null,
        },
      });
    });

    it('applies partial update without changing omitted fields', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(editableWorkOrder);
      prisma.workOrderTask.update.mockResolvedValue({
        ...pendingTask,
        diagnosis: 'Noise on braking',
      });

      await service.updateTaskTechnicalNotes(workOrderId, taskId, {
        diagnosis: 'Noise on braking',
      });

      expect(prisma.workOrderTask.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: {
          diagnosis: 'Noise on braking',
        },
      });
    });
  });

  describe('updateVisitNotes', () => {
    const dto: UpdateVisitNotesDto = {
      visitDiagnosis: ' General inspection ',
      visitRepairSummary: 'Pads replaced',
      visitPartsUsed: 'Pads',
      visitAdditionalNotes: null,
    };

    it('updates visit notes when WO is EN_PROCESO', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(editableWorkOrder);
      prisma.workOrder.update.mockResolvedValue({
        id: workOrderId,
        status: WorkOrderStatus.EN_PROCESO,
        visitDiagnosis: 'General inspection',
        visitRepairSummary: 'Pads replaced',
        visitPartsUsed: 'Pads',
        visitAdditionalNotes: null,
      });

      const result = await service.updateVisitNotes(workOrderId, dto);

      expect(prisma.workOrder.update).toHaveBeenCalledWith({
        where: { id: workOrderId },
        data: {
          visitDiagnosis: 'General inspection',
          visitRepairSummary: 'Pads replaced',
          visitPartsUsed: 'Pads',
          visitAdditionalNotes: null,
        },
        select: {
          id: true,
          status: true,
          visitDiagnosis: true,
          visitRepairSummary: true,
          visitPartsUsed: true,
          visitAdditionalNotes: true,
        },
      });
      expect(result.visitDiagnosis).toBe('General inspection');
    });

    it('throws ForbiddenException when WO is LISTA_PARA_ENTREGA', async () => {
      prisma.workOrder.findUnique.mockResolvedValue({
        ...editableWorkOrder,
        status: WorkOrderStatus.LISTA_PARA_ENTREGA,
      });

      await expect(service.updateVisitNotes(workOrderId, dto)).rejects.toThrow(
        new ForbiddenException('Work order is not editable'),
      );
    });

    it('clears visit field with null', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(editableWorkOrder);
      prisma.workOrder.update.mockResolvedValue({
        id: workOrderId,
        status: WorkOrderStatus.EN_PROCESO,
        visitDiagnosis: null,
        visitRepairSummary: null,
        visitPartsUsed: null,
        visitAdditionalNotes: null,
      });

      await service.updateVisitNotes(workOrderId, {
        visitDiagnosis: null,
      });

      expect(prisma.workOrder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { visitDiagnosis: null },
        }),
      );
    });

    it('throws NotFoundException when work order is missing', async () => {
      prisma.workOrder.findUnique.mockResolvedValue(null);

      await expect(service.updateVisitNotes(workOrderId, dto)).rejects.toThrow(
        new NotFoundException('Work order not found'),
      );
    });
  });
});
