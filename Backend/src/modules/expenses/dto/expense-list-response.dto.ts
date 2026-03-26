import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseDto } from './expense-response.dto';

/**
 * Metadatos de paginación para lista de gastos
 */
export class ExpensePaginationMeta {
  @ApiProperty({
    description: 'Total de gastos en el viaje',
    example: 45,
  })
  total!: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Límite de gastos por página',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Indica si hay más gastos en páginas siguientes',
    example: true,
  })
  hasMore!: boolean;
}

/**
 * DTO para respuesta de lista paginada de gastos
 */
export class ExpenseListResponseDto {
  @ApiProperty({
    description: 'Lista de gastos del viaje',
    type: [ExpenseResponseDto],
  })
  expenses!: ExpenseResponseDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: ExpensePaginationMeta,
  })
  meta!: ExpensePaginationMeta;
}
