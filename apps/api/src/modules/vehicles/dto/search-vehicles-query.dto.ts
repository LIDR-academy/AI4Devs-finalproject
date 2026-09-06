import { IsOptional, IsString } from 'class-validator';

export class SearchVehiclesQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;
}
