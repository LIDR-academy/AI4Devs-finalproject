import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '../enums/trip-status.enum';
import { TripCurrency } from '../enums/trip-currency.enum';

/**
 * DTO para la respuesta al crear o consultar un viaje.
 * Incluye todos los campos públicos del viaje.
 */
export class TripResponseDto {
  @ApiProperty({
    description: 'ID único del viaje',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del viaje',
    example: 'Viaje a Cartagena',
  })
  name!: string;

  @ApiProperty({
    description: 'Moneda del viaje (COP o USD)',
    enum: TripCurrency,
    example: TripCurrency.COP,
  })
  currency!: string;

  @ApiProperty({
    description: 'Estado del viaje',
    enum: TripStatus,
    example: TripStatus.ACTIVE,
  })
  status!: TripStatus;

  @ApiProperty({
    description: 'Código alfanumérico único del viaje para compartir',
    example: 'ABC123XYZ',
  })
  code!: string;

  @ApiProperty({
    description: 'Fecha de creación del viaje',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del viaje',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}
