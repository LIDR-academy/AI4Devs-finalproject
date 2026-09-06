import { WorkOrderTaskStatus } from '@prisma/client';
import { calculateTotalAmount } from './work-order-totals';

describe('calculateTotalAmount', () => {
  it('returns 0 when no completed tasks', () => {
    expect(
      calculateTotalAmount([
        { status: WorkOrderTaskStatus.PENDING, cost: null },
        { status: WorkOrderTaskStatus.IN_PROGRESS, cost: null },
      ]),
    ).toBe(0);
  });

  it('sums completed task costs only', () => {
    expect(
      calculateTotalAmount([
        { status: WorkOrderTaskStatus.COMPLETED, cost: { toString: () => '50.5' } as never },
        { status: WorkOrderTaskStatus.COMPLETED, cost: { toString: () => '25.25' } as never },
        { status: WorkOrderTaskStatus.PENDING, cost: null },
      ]),
    ).toBe(75.75);
  });
});
