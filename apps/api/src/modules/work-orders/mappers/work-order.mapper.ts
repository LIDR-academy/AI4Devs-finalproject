import {
  Client,
  Prisma,
  User,
  Vehicle,
  WorkOrder,
  WorkOrderTask,
  WorkOrderTaskStatus,
} from '@prisma/client';
import {
  WorkOrderDetailResponseDto,
  WorkOrderTaskResponseDto,
} from '../dto/work-order-detail-response.dto';
import { calculateTotalAmount } from '../utils/work-order-totals';

export type WorkOrderWithRelations = WorkOrder & {
  tasks: WorkOrderTask[];
  vehicle: Pick<Vehicle, 'licensePlate' | 'brand' | 'model'>;
  ownerClient: Pick<Client, 'fullName' | 'nationalId'>;
  assignedMechanic?: Pick<User, 'id' | 'fullName' | 'role'> | null;
};

export function toWorkOrderTaskResponse(
  task: WorkOrderTask,
): WorkOrderTaskResponseDto {
  return {
    id: task.id,
    description: task.description,
    status: task.status,
    cost: task.cost !== null ? Number(task.cost) : null,
    costNotes: task.costNotes,
    diagnosis: task.diagnosis,
    repairPerformed: task.repairPerformed,
    partsUsed: task.partsUsed,
    additionalNotes: task.additionalNotes,
    sortOrder: task.sortOrder,
    completedAt: task.completedAt,
  };
}

export function toWorkOrderDetailResponse(
  workOrder: WorkOrderWithRelations,
): WorkOrderDetailResponseDto {
  return {
    id: workOrder.id,
    vehicleId: workOrder.vehicleId,
    ownerClientId: workOrder.ownerClientId,
    status: workOrder.status,
    entryReason: workOrder.entryReason,
    mileage: workOrder.mileage,
    assignedMechanicId: workOrder.assignedMechanicId,
    assignedMechanic: workOrder.assignedMechanic
      ? {
          id: workOrder.assignedMechanic.id,
          fullName: workOrder.assignedMechanic.fullName,
          role: workOrder.assignedMechanic.role,
        }
      : null,
    checkedInAt: workOrder.checkedInAt,
    updatedAt: workOrder.updatedAt,
    createdById: workOrder.createdById,
    totalAmount: calculateTotalAmount(workOrder.tasks),
    visitDiagnosis: workOrder.visitDiagnosis,
    visitRepairSummary: workOrder.visitRepairSummary,
    visitPartsUsed: workOrder.visitPartsUsed,
    visitAdditionalNotes: workOrder.visitAdditionalNotes,
    tasks: workOrder.tasks.map(toWorkOrderTaskResponse),
    vehicle: {
      licensePlate: workOrder.vehicle.licensePlate,
      brand: workOrder.vehicle.brand,
      model: workOrder.vehicle.model,
    },
    owner: {
      fullName: workOrder.ownerClient.fullName,
      nationalId: workOrder.ownerClient.nationalId,
    },
  };
}

export function sumCompletedTaskCosts(
  tasks: Array<Pick<WorkOrderTask, 'status' | 'cost'>>,
): number | null {
  const completedCosts = tasks
    .filter(
      (task) =>
        task.status === WorkOrderTaskStatus.COMPLETED && task.cost !== null,
    )
    .map((task) => Number(task.cost));

  if (completedCosts.length === 0) {
    return null;
  }

  return completedCosts.reduce((sum, cost) => sum + cost, 0);
}

export const WORK_ORDER_DETAIL_INCLUDE = {
  tasks: {
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  vehicle: {
    select: { licensePlate: true, brand: true, model: true },
  },
  ownerClient: {
    select: { fullName: true, nationalId: true },
  },
  assignedMechanic: {
    select: { id: true, fullName: true, role: true },
  },
} satisfies Prisma.WorkOrderInclude;
