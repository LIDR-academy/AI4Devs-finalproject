import { WorkOrderTaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateTaskDto {
  @IsEnum(WorkOrderTaskStatus)
  status!: WorkOrderTaskStatus;

  @ValidateIf((dto: UpdateTaskDto) => dto.status === WorkOrderTaskStatus.COMPLETED)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ValidateIf((dto: UpdateTaskDto) => dto.status === WorkOrderTaskStatus.COMPLETED)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  costNotes?: string;
}
