import { WorkOrderStatus } from '@prisma/client';
import { OwnerContactedByDto } from './delivery-ready-item.dto';

export class MarkContactedResponseDto {
  workOrderId!: string;
  status!: WorkOrderStatus;
  ownerContactedAt!: Date;
  ownerContactedBy!: OwnerContactedByDto;
}
