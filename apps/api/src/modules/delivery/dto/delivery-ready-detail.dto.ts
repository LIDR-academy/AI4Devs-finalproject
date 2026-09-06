import { WorkOrderStatus, WorkOrderTaskStatus } from '@prisma/client';
import { DeliveryReadyItemDto } from './delivery-ready-item.dto';

export class DeliveryReadyTaskDto {
  id!: string;
  description!: string;
  status!: WorkOrderTaskStatus;
  cost!: number | null;
  costNotes!: string | null;
}

export class DeliveryReadyVehicleDto {
  licensePlate!: string;
  brand!: string;
  model!: string;
  year!: number;
}

export class DeliveryReadyOwnerDto {
  fullName!: string;
  nationalId!: string;
  phone!: string | null;
  email!: string | null;
}

export class DeliveryReadyDetailDto extends DeliveryReadyItemDto {
  status!: WorkOrderStatus;
  entryReason!: string;
  mileage!: number | null;
  vehicleId!: string;
  vehicle!: DeliveryReadyVehicleDto;
  owner!: DeliveryReadyOwnerDto | null;
  tasks!: DeliveryReadyTaskDto[];
}
