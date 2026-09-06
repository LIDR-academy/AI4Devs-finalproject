import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { WorkOrderIntakeMode } from '../constants/intake-mode';
import { InitialTaskDto } from './initial-task.dto';

export class CreateWorkOrderDto {
  @IsUUID()
  vehicleId!: string;

  @IsString()
  @Length(5, 500)
  entryReason!: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== null && value !== undefined)
  @IsInt()
  @Min(0)
  @Type(() => Number)
  mileage?: number | null;

  @IsOptional()
  @IsUUID()
  assignedMechanicId?: string;

  @IsOptional()
  @IsEnum(WorkOrderIntakeMode)
  intakeMode?: WorkOrderIntakeMode;

  @IsOptional()
  @IsString()
  @Length(2, 150)
  broughtByName?: string;

  @IsOptional()
  @ValidateIf(
    (_object, value) => value !== null && value !== undefined && value !== '',
  )
  @IsString()
  @Matches(/^[0-9]{8,15}$/)
  broughtByPhone?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InitialTaskDto)
  initialTasks!: InitialTaskDto[];
}
