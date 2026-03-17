import { ApiProperty } from '@nestjs/swagger';
import { TripResponseDto } from './trip-response.dto';
import { TripParticipantDto } from './trip-participant.dto';
import { ParticipantRole } from '../enums';

/**
 * Metadatos de paginación para participantes
 */
export class ParticipantsPaginationMeta {
  @ApiProperty({
    description: 'Total de participantes en el viaje',
    example: 25,
  })
  total!: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Límite de participantes por página',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Indica si hay más participantes en páginas siguientes',
    example: true,
  })
  hasMore!: boolean;
}

/**
 * DTO con detalles completos de un viaje incluyendo participantes paginados
 * Extiende la respuesta básica agregando información de participación
 */
export class TripDetailResponseDto extends TripResponseDto {
  @ApiProperty({
    description: 'Rol del usuario actual en el viaje',
    enum: ParticipantRole,
    example: ParticipantRole.CREATOR,
  })
  userRole!: ParticipantRole;

  @ApiProperty({
    description: 'Lista paginada de participantes del viaje',
    type: [TripParticipantDto],
  })
  participants!: TripParticipantDto[];

  @ApiProperty({
    description: 'Metadatos de paginación de participantes',
    type: ParticipantsPaginationMeta,
  })
  participantsMeta!: ParticipantsPaginationMeta;

  @ApiProperty({
    description: 'Monto total de gastos del viaje en la moneda del viaje',
    example: 1250000,
    minimum: 0,
  })
  totalAmount!: number;
}
