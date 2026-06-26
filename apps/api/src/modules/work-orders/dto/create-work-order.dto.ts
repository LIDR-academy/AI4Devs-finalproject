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
  ValidateNested,
} from 'class-validator';
import { InitialTaskDto } from './initial-task.dto';

export class CreateWorkOrderDto {
  @IsUUID()
  vehicleId!: string;

  @IsString()
  @Length(5, 500)
  entryReason!: string;

  @IsInt()
  @Min(0)
  mileage!: number;

  @IsOptional()
  @IsUUID()
  assignedMechanicId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InitialTaskDto)
  initialTasks!: InitialTaskDto[];
}
