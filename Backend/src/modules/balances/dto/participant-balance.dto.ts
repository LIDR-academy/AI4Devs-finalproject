import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for participant balance information.
 * Contains balance details for a single participant.
 */
export class ParticipantBalanceDto {
  @ApiProperty({
    description: 'ID del usuario participante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
  })
  user_name!: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'juan@example.com',
  })
  user_email!: string;

  @ApiProperty({
    description: 'Total gastado por el usuario (suma de gastos donde es pagador)',
    example: 150000.0,
  })
  total_spent!: number;

  @ApiProperty({
    description: 'Total que debe el usuario (suma de amount_owed en expense_splits)',
    example: 75000.0,
  })
  total_owed!: number;

  @ApiProperty({
    description: 'Balance neto (total_spent - total_owed). Positivo = le deben, Negativo = debe',
    example: 75000.0,
  })
  balance!: number;
}
