import { Prisma, WorkOrderTaskStatus } from '@prisma/client';

export function calculateTotalAmount(
  tasks: Array<{
    status: WorkOrderTaskStatus;
    cost: Prisma.Decimal | null;
  }>,
): number {
  const total = tasks
    .filter(
      (task) =>
        task.status === WorkOrderTaskStatus.COMPLETED && task.cost !== null,
    )
    .reduce((sum, task) => sum + Number(task.cost), 0);

  return Math.round(total * 100) / 100;
}
