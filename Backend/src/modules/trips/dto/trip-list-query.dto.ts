import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TripStatus } from '../enums/trip-status.enum';

/**
 * DTO para filtrar la lista de viajes del usuario.
 * Todos los campos son opcionales.
 */
export class TripListQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado del viaje',
    enum: TripStatus,
    example: TripStatus.ACTIVE,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(TripStatus, {
    message: `El estado debe ser uno de: ${Object.values(TripStatus).join(', ')}`,
  })
  status?: TripStatus;
}
