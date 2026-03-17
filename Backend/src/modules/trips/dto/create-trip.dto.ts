import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  IsEmail,
  IsOptional,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TripCurrency } from '../enums/trip-currency.enum';

/**
 * Data Transfer Object for creating a new trip.
 * Contains all necessary validations for trip creation input fields.
 *
 * @class CreateTripDto
 * @description This DTO is used to validate and structure trip creation data
 * before it is processed by the trip service. The currency is optional and defaults to COP
 * if not specified. Supported currencies are COP and USD.
 */
export class CreateTripDto {
  /**
   * Trip name.
   * Must be a non-empty string.
   *
   * @type {string}
   * @memberof CreateTripDto
   * @example "Viaje a Cartagena"
   */
  @ApiProperty({
    description: 'Nombre del viaje',
    example: 'Viaje a Cartagena',
    type: String,
  })
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString()
  @IsNotEmpty({ message: 'El nombre del viaje es requerido' })
  @MaxLength(255, {
    message: 'El nombre del viaje no puede exceder 255 caracteres',
  })
  name!: string;

  /**
   * Optional array of email addresses to invite as members.
   * Users must already be registered in the system.
   *
   * @type {string[]}
   * @memberof CreateTripDto
   * @example ["maria@example.com", "pedro@example.com"]
   */
  @ApiProperty({
    description: 'Lista opcional de emails de usuarios a invitar como miembros',
    example: ['maria@example.com', 'pedro@example.com'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Los emails deben ser un array' })
  @ArrayMinSize(0, {
    message: 'El array de emails no puede estar vacío si se proporciona',
  })
  @IsEmail(
    {},
    { each: true, message: 'Cada email debe tener un formato válido' },
  )
  memberEmails?: string[];

  /**
   * Trip currency.
   * Optional field. If not provided, defaults to COP.
   * Supported values: COP (Colombian Peso) or USD (US Dollar).
   *
   * @type {TripCurrency}
   * @memberof CreateTripDto
   * @example TripCurrency.COP
   */
  @ApiProperty({
    description:
      'Moneda del viaje (COP o USD). Si no se especifica, por defecto es COP',
    enum: TripCurrency,
    example: TripCurrency.COP,
    required: false,
    default: TripCurrency.COP,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsEnum(TripCurrency, {
    message: `La moneda debe ser uno de: ${Object.values(TripCurrency).join(', ')}`,
  })
  currency?: TripCurrency;
}
