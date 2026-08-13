import { CurrentOwnerDto } from '../../vehicles/dto/current-owner.dto';
import { VehicleHistoryVisitDto } from './vehicle-history-visit.dto';

export class VehicleHistoryResponseDto {
  vehicleId!: string;
  licensePlate!: string;
  vehicleLabel!: string;
  currentOwner!: CurrentOwnerDto | null;
  visits!: VehicleHistoryVisitDto[];
  total!: number;
}
