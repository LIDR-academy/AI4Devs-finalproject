import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '../enums/trip-status.enum';

/**
 * Data Transfer Object for updating a trip.
 * Contains validations for trip update input fields.
 * Only the trip name and status can be updated. Currency and code cannot be changed.
 *
 * @class UpdateTripDto
 * @description This DTO is used to validate and structure trip update data
 * before it is processed by the trip service.
 */
export class UpdateTripDto {
  /**
   * Trip name.
   * Optional field. If provided, must be a non-empty string.
   *
   * @type {string}
   * @memberof UpdateTripDto
   * @example "Viaje a Cartagena - Actualizado"
   */
  @ApiProperty({
    description: 'Nombre del viaje a actualizar',
    example: 'Viaje a Cartagena - Actualizado',
    type: String,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value == null || value === '') return undefined;
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number') return String(value);
    return undefined;
  })
  @IsString({ message: 'El nombre del viaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del viaje no puede estar vacío' })
  @MaxLength(255, {
    message: 'El nombre del viaje no puede exceder 255 caracteres',
  })
  name?: string;

  /**
   * Trip status.
   * Optional field. If provided, must be ACTIVE or CLOSED.
   *
   * @type {TripStatus}
   * @memberof UpdateTripDto
   * @example TripStatus.CLOSED
   */
  @ApiProperty({
    description: 'Estado del viaje (ACTIVE o CLOSED)',
    example: TripStatus.CLOSED,
    enum: TripStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TripStatus, {
    message: `El estado debe ser uno de: ${Object.values(TripStatus).join(', ')}`,
  })
  status?: TripStatus;
}
