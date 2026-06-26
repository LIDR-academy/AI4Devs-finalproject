import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WorkOrderStatus,
  WorkOrderTask,
  WorkOrderTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TaskTechnicalNotesResponseDto,
  VisitNotesResponseDto,
} from './dto/task-technical-notes-response.dto';
import { UpdateTaskTechnicalNotesDto } from './dto/update-task-technical-notes.dto';
import { UpdateVisitNotesDto } from './dto/update-visit-notes.dto';
import {
  buildTaskTechnicalNotesUpdate,
  buildVisitNotesUpdate,
} from './utils/technical-notes-normalizer';

@Injectable()
export class WorkOrderTechnicalNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async updateTaskTechnicalNotes(
    workOrderId: string,
    taskId: string,
    dto: UpdateTaskTechnicalNotesDto,
  ): Promise<TaskTechnicalNotesResponseDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        tasks: {
          where: { id: taskId },
        },
      },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== WorkOrderStatus.EN_PROCESO) {
      throw new ForbiddenException('Work order is not editable');
    }

    const task = workOrder.tasks[0];
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.status === WorkOrderTaskStatus.COMPLETED) {
      throw new ForbiddenException(
        'Cannot edit technical notes on a completed task',
      );
    }

    const updatedTask = await this.prisma.workOrderTask.update({
      where: { id: taskId },
      data: buildTaskTechnicalNotesUpdate(dto),
    });

    return toTaskTechnicalNotesResponse(updatedTask);
  }

  async updateVisitNotes(
    workOrderId: string,
    dto: UpdateVisitNotesDto,
  ): Promise<VisitNotesResponseDto> {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    if (workOrder.status !== WorkOrderStatus.EN_PROCESO) {
      throw new ForbiddenException('Work order is not editable');
    }

    const updatedWorkOrder = await this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: buildVisitNotesUpdate(dto),
      select: {
        id: true,
        status: true,
        visitDiagnosis: true,
        visitRepairSummary: true,
        visitPartsUsed: true,
        visitAdditionalNotes: true,
      },
    });

    return updatedWorkOrder;
  }
}

function toTaskTechnicalNotesResponse(
  task: WorkOrderTask,
): TaskTechnicalNotesResponseDto {
  return {
    id: task.id,
    description: task.description,
    status: task.status,
    diagnosis: task.diagnosis,
    repairPerformed: task.repairPerformed,
    partsUsed: task.partsUsed,
    additionalNotes: task.additionalNotes,
  };
}
