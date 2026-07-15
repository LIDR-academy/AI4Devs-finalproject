import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
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

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InitialTaskDto)
  initialTasks!: InitialTaskDto[];
}
