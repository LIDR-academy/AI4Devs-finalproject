import { WorkOrderStatus } from '@prisma/client';

export class OwnerContactedByDto {
  id!: string;
  fullName!: string;
}

export class DeliveryReadyItemDto {
  workOrderId!: string;
  licensePlate!: string;
  vehicleLabel!: string;
  ownerName!: string | null;
  ownerPhone!: string | null;
  ownerPhoneDisplay!: string | null;
  ownerEmail!: string | null;
  broughtByName!: string | null;
  broughtByPhone!: string | null;
  totalAmount!: number;
  checkedInAt!: Date;
  elapsedLabel!: string;
  status!: WorkOrderStatus;
  ownerContactedAt!: Date | null;
  ownerContactedBy!: OwnerContactedByDto | null;
}
