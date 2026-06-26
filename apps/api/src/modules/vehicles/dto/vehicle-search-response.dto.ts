import { VehicleResponseDto } from './vehicle-response.dto';

export class VehicleSearchResponseDto {
  items!: VehicleResponseDto[];
  total!: number;
}
