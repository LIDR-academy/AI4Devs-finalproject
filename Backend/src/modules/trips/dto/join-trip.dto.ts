import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for joining an existing trip by code.
 * Contains all necessary validations for trip code input.
 *
 * @class JoinTripDto
 * @description This DTO is used to validate and structure trip join data.
 * The code is automatically transformed to uppercase for case-insensitive matching.
 */
export class JoinTripDto {
  /**
   * Trip code.
   * Must be an 8-character alphanumeric string (uppercase letters and numbers).
   * Input is automatically converted to uppercase and trimmed.
   *
   * @type {string}
   * @memberof JoinTripDto
   * @example "ABC12345"
   */
  @ApiProperty({
    description:
      'Código único del viaje para unirse (8 caracteres alfanuméricos)',
    example: 'ABC12345',
    type: String,
    minLength: 8,
    maxLength: 8,
  })
  @Transform(({ value }) =>
    String(value ?? '')
      .toUpperCase()
      .trim(),
  )
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código del viaje es requerido' })
  @Length(8, 8, { message: 'El código debe tener exactamente 8 caracteres' })
  @Matches(/^[A-Z0-9]{8}$/, {
    message: 'El código debe contener solo letras mayúsculas y números',
  })
  code!: string;
}
