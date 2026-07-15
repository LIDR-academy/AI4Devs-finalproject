import { WorkOrderStatus } from '@prisma/client';

export class OwnerContactedByDto {
  id!: string;
  fullName!: string;
}

export class DeliveryReadyItemDto {
  workOrderId!: string;
  licensePlate!: string;
  vehicleLabel!: string;
  ownerName!: string;
  ownerPhone!: string | null;
  ownerPhoneDisplay!: string | null;
  ownerEmail!: string | null;
  totalAmount!: number;
  checkedInAt!: Date;
  elapsedLabel!: string;
  status!: WorkOrderStatus;
  ownerContactedAt!: Date | null;
  ownerContactedBy!: OwnerContactedByDto | null;
}
