import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { MAX_VEHICLE_YEAR } from '../utils/vehicle-year.constants';

export class UpdateVehicleDto {
  @IsString()
  @Length(2, 15)
  licensePlate!: string;

  @IsString()
  @Length(1, 60)
  brand!: string;

  @IsString()
  @Length(1, 60)
  model!: string;

  @IsInt()
  @Min(1900)
  @Max(MAX_VEHICLE_YEAR)
  year!: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  color?: string;
}
