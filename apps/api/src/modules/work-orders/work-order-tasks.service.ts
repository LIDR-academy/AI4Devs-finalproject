import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  WorkOrderStatus,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskResponseDto } from './dto/update-task-response.dto';
import { WorkOrderTaskResponseDto } from './dto/work-order-detail-response.dto';
import { toWorkOrderTaskResponse } from './mappers/work-order.mapper';
import { assertValidTaskTransition } from './validators/task-status-transition.validator';
import { calculateTotalAmount } from './utils/work-order-totals';

@Injectable()
export class WorkOrderTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async addTask(
    workOrderId: string,
    dto: CreateTaskDto,
  ): Promise<WorkOrderTaskResponseDto> {
    const task = await this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: { tasks: true },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      this.assertWorkOrderEditable(workOrder.status);

      const maxSortOrder = workOrder.tasks.reduce(
        (max, current) => Math.max(max, current.sortOrder),
        -1,
      );

      return tx.workOrderTask.create({
        data: {
          workOrderId,
          description: dto.description.trim(),
          status: WorkOrderTaskStatus.PENDING,
          sortOrder: maxSortOrder + 1,
        },
      });
    });

    return toWorkOrderTaskResponse(task);
  }

  async updateTask(
    workOrderId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<UpdateTaskResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const workOrder = await tx.workOrder.findUnique({
        where: { id: workOrderId },
        include: { tasks: true },
      });

      if (!workOrder) {
        throw new NotFoundException('Work order not found');
      }

      this.assertWorkOrderEditable(workOrder.status);

      const task = workOrder.tasks.find((item) => item.id === taskId);
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.status === WorkOrderTaskStatus.COMPLETED) {
        throw new ConflictException('Task is already completed');
      }

      this.validateUpdatePayload(task.status, dto);

      await tx.workOrderTask.update({
        where: { id: taskId },
        data: this.buildTaskUpdateData(dto),
      });

      const updatedTasks = await tx.workOrderTask.findMany({
        where: { workOrderId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      let workOrderStatus = workOrder.status;
      const allCompleted =
        updatedTasks.length > 0 &&
        updatedTasks.every(
          (item) => item.status === WorkOrderTaskStatus.COMPLETED,
        );

      if (allCompleted) {
        const updatedWorkOrder = await tx.workOrder.update({
          where: { id: workOrderId },
          data: { status: WorkOrderStatus.LISTA_PARA_ENTREGA },
        });
        workOrderStatus = updatedWorkOrder.status;
      }

      const updatedWorkOrder = await tx.workOrder.findUniqueOrThrow({
        where: { id: workOrderId },
      });

      const updatedTask = updatedTasks.find((item) => item.id === taskId);
      if (!updatedTask) {
        throw new NotFoundException('Task not found');
      }

      return {
        task: toWorkOrderTaskResponse(updatedTask),
        workOrder: {
          id: updatedWorkOrder.id,
          status: workOrderStatus,
          totalAmount: calculateTotalAmount(updatedTasks),
          updatedAt: updatedWorkOrder.updatedAt,
        },
      };
    });
  }

  private assertWorkOrderEditable(status: WorkOrderStatus): void {
    if (status !== WorkOrderStatus.EN_PROCESO) {
      throw new ForbiddenException('Work order is not editable');
    }
  }

  private validateUpdatePayload(
    currentStatus: WorkOrderTaskStatus,
    dto: UpdateTaskDto,
  ): void {
    if (dto.status !== WorkOrderTaskStatus.COMPLETED) {
      if (dto.cost !== undefined) {
        throw new BadRequestException(
          'Cost is only allowed when completing a task',
        );
      }

      if (dto.costNotes !== undefined) {
        throw new BadRequestException(
          'Cost notes are only allowed when completing a task',
        );
      }
    }

    assertValidTaskTransition(currentStatus, dto.status);

    if (dto.status === WorkOrderTaskStatus.COMPLETED) {
      if (dto.cost == null || dto.cost < 0) {
        throw new BadRequestException(
          'Cost is required when completing a task',
        );
      }
    }
  }

  private buildTaskUpdateData(
    dto: UpdateTaskDto,
  ): Prisma.WorkOrderTaskUpdateInput {
    if (dto.status === WorkOrderTaskStatus.COMPLETED) {
      return {
        status: dto.status,
        cost: dto.cost,
        costNotes: dto.costNotes?.trim() ?? null,
        completedAt: new Date(),
      };
    }

    return {
      status: dto.status,
    };
  }
}
