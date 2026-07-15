import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class DeliverWorkOrderDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  mileage?: number;
}
