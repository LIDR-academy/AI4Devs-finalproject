import { CurrentOwnerDto } from './current-owner.dto';

export class VehicleResponseDto {
  id!: string;
  licensePlate!: string;
  brand!: string;
  model!: string;
  year!: number;
  color!: string | null;
  currentOwner!: CurrentOwnerDto | null;
  createdAt!: Date;
}
