import { Allow, IsInt, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkOrderMileageDto {
  @Allow()
  @ValidateIf((_object, value) => value !== null)
  @IsInt()
  @Min(0)
  @Type(() => Number)
  mileage!: number | null;
}

export class UpdateWorkOrderMileageResponseDto {
  id!: string;
  mileage!: number | null;
  updatedAt!: Date;
}
