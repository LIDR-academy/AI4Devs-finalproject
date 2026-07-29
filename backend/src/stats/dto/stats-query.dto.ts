import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class StatsQueryDto {
  @IsIn(['year', 'month'])
  period!: 'year' | 'month';

  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(2100)
  year!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;
}
