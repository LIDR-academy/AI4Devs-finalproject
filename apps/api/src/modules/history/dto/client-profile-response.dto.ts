import { ClientVehicleSummaryDto } from './client-vehicle-summary.dto';

export class ClientProfileResponseDto {
  id!: string;
  fullName!: string;
  nationalId!: string;
  phone!: string | null;
  email!: string | null;
  createdAt!: Date;
  vehicles!: ClientVehicleSummaryDto[];
}
