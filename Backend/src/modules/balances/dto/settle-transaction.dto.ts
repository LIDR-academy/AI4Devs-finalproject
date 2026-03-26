import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for a settlement transaction.
 * Represents a simplified debt transaction between two users.
 */
export class SettleTransactionDto {
  @ApiProperty({
    description: 'ID del usuario que debe pagar',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  from_user_id!: string;

  @ApiProperty({
    description: 'Nombre del usuario que debe pagar',
    example: 'Juan Pérez',
  })
  from_user_name!: string;

  @ApiProperty({
    description: 'ID del usuario que debe recibir',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  to_user_id!: string;

  @ApiProperty({
    description: 'Nombre del usuario que debe recibir',
    example: 'María García',
  })
  to_user_name!: string;

  @ApiProperty({
    description: 'Monto a transferir en COP',
    example: 50000.0,
  })
  amount!: number;
}
