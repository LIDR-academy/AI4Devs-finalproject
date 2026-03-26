import { IsUUID, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO for expense beneficiary information.
 * Represents a user who should pay part of an expense.
 */
export class CreateExpenseBeneficiaryDto {
  /**
   * User ID of the beneficiary.
   * Must be a valid UUID.
   *
   * @type {string}
   */
  @ApiProperty({
    description: 'ID del usuario beneficiario del gasto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID('4', { message: 'El user_id debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El user_id es requerido' })
  user_id!: string;

  /**
   * Amount owed by this beneficiary.
   * Optional - if not provided, will be calculated as fair share.
   * Must be a positive number if provided.
   *
   * @type {number}
   */
  @ApiProperty({
    description:
      'Monto que debe pagar este beneficiario (opcional, se calcula equitativamente si no se proporciona)',
    example: 50000.0,
    type: Number,
    required: false,
    minimum: 0.01,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    {
      message:
        'El amount_owed debe ser un número válido con máximo 2 decimales',
    },
  )
  @Min(0.01, { message: 'El amount_owed debe ser mayor a 0' })
  amount_owed?: number;
}
