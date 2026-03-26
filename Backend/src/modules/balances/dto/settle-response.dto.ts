import { ApiProperty } from '@nestjs/swagger';
import { SettleTransactionDto } from './settle-transaction.dto';

/**
 * DTO for settle balances response.
 * Contains simplified debt transactions.
 */
export class SettleResponseDto {
  @ApiProperty({
    description: 'ID del viaje',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  trip_id!: string;

  @ApiProperty({
    description: 'Lista de transacciones simplificadas para equilibrar cuentas',
    type: [SettleTransactionDto],
  })
  transactions!: SettleTransactionDto[];

  @ApiProperty({
    description: 'Número total de transacciones necesarias',
    example: 2,
  })
  total_transactions!: number;
}
