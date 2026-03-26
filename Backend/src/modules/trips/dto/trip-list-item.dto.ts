import { ApiProperty } from '@nestjs/swagger';
import { TripResponseDto } from './trip-response.dto';
import { ParticipantRole } from '../enums/participant-role.enum';

/**
 * DTO extendido para respuesta de lista de viajes.
 * Incluye información adicional del rol del usuario y cantidad de participantes.
 */
export class TripListItemDto extends TripResponseDto {
  @ApiProperty({
    description: 'Rol del usuario autenticado en este viaje',
    enum: ParticipantRole,
    example: ParticipantRole.CREATOR,
  })
  userRole!: ParticipantRole;

  @ApiProperty({
    description: 'Cantidad total de participantes en el viaje',
    example: 5,
    minimum: 1,
  })
  participantCount!: number;

  @ApiProperty({
    description: 'Monto total de gastos del viaje en COP',
    example: 1250000,
    minimum: 0,
  })
  totalAmount!: number;
}
