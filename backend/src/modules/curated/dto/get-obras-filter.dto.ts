import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetObrasFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  duracion_max?: number;

  @IsOptional()
  @IsString()
  mood?: string;
}
