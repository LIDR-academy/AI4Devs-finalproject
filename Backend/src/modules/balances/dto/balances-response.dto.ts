import { ApiProperty } from '@nestjs/swagger';
import { ParticipantBalanceDto } from './participant-balance.dto';

/**
 * DTO for balances response.
 * Contains all participant balances for a trip.
 */
export class BalancesResponseDto {
  @ApiProperty({
    description: 'ID del viaje',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  trip_id!: string;

  @ApiProperty({
    description: 'Total de gastos del viaje',
    example: 300000.0,
  })
  total_expenses!: number;

  @ApiProperty({
    description: 'Cantidad de participantes en el viaje',
    example: 3,
  })
  participant_count!: number;

  @ApiProperty({
    description: 'Lista de balances por participante',
    type: [ParticipantBalanceDto],
  })
  balances!: ParticipantBalanceDto[];
}
