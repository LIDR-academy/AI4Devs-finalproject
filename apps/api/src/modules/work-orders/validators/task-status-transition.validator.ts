import { BadRequestException } from '@nestjs/common';
import { WorkOrderTaskStatus } from '@prisma/client';

const ALLOWED_TRANSITIONS: Record<
  WorkOrderTaskStatus,
  WorkOrderTaskStatus[]
> = {
  [WorkOrderTaskStatus.PENDING]: [
    WorkOrderTaskStatus.IN_PROGRESS,
    WorkOrderTaskStatus.COMPLETED,
  ],
  [WorkOrderTaskStatus.IN_PROGRESS]: [WorkOrderTaskStatus.COMPLETED],
  [WorkOrderTaskStatus.COMPLETED]: [],
};

export function assertValidTaskTransition(
  from: WorkOrderTaskStatus,
  to: WorkOrderTaskStatus,
): void {
  if (from === to) {
    return;
  }

  const allowed = ALLOWED_TRANSITIONS[from];
  if (!allowed.includes(to)) {
    throw new BadRequestException('Invalid task status transition');
  }
}
