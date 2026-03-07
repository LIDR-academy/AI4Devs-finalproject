import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para filtrar y paginar la lista de gastos de un viaje.
 * Todos los campos son opcionales.
 */
export class ExpenseListQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página (default: 1)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de elementos por página (default: 20, máximo: 100)',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de categoría',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  category_id?: number;
}
