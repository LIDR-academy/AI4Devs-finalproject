import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipantRole } from '../enums';
import { UserSummaryDto } from './user-summary.dto';

/**
 * DTO para representar un participante de un viaje
 * Incluye el rol del participante y datos básicos del usuario
 */
export class TripParticipantDto {
  @ApiProperty({
    description: 'ID único del registro de participación',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del usuario participante',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  userId!: string;

  @ApiProperty({
    description: 'Rol del participante en el viaje',
    enum: ParticipantRole,
    example: ParticipantRole.MEMBER,
  })
  role!: ParticipantRole;

  @ApiPropertyOptional({
    description: 'Información básica del usuario',
    type: () => UserSummaryDto,
    nullable: true,
  })
  user?: UserSummaryDto | null;
}
