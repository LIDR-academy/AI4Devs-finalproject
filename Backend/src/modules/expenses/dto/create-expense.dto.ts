import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  IsInt,
  IsPositive,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUrl,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateExpenseBeneficiaryDto } from './create-expense-beneficiary.dto';

/**
 * Data Transfer Object for creating a new expense.
 * Contains all necessary validations for expense creation input fields.
 */
export class CreateExpenseDto {
  /**
   * Expense title.
   * Must be a non-empty string with maximum 255 characters.
   *
   * @type {string}
   */
  @ApiProperty({
    description: 'Título del gasto',
    example: 'Cena en restaurante',
    type: String,
    maxLength: 255,
  })
  @Transform(({ value }) => String(value ?? '').trim())
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  @MaxLength(255, {
    message: 'El título no puede exceder 255 caracteres',
  })
  title!: string;

  /**
   * Expense amount in COP.
   * Must be a positive number with maximum 2 decimal places.
   *
   * @type {number}
   */
  @ApiProperty({
    description: 'Monto del gasto en COP',
    example: 150000.0,
    type: Number,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El monto debe ser un número válido con máximo 2 decimales' },
  )
  @IsPositive({ message: 'El monto debe ser un número positivo' })
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount!: number;

  /**
   * Category ID.
   * Must be a valid integer that exists in expense_categories table.
   *
   * @type {number}
   */
  @ApiProperty({
    description: 'ID de la categoría del gasto',
    example: 1,
    type: Number,
  })
  @Type(() => Number)
  @IsInt({ message: 'El category_id debe ser un número entero' })
  @IsPositive({ message: 'El category_id debe ser un número positivo' })
  category_id!: number;

  /**
   * Expense date.
   * Must be a valid date string in ISO format.
   *
   * @type {string}
   */
  @ApiProperty({
    description: 'Fecha del gasto (formato ISO: YYYY-MM-DD)',
    example: '2024-01-15',
    type: String,
  })
  @IsDateString(
    {},
    { message: 'La fecha del gasto debe tener un formato válido (YYYY-MM-DD)' },
  )
  @IsNotEmpty({ message: 'La fecha del gasto es requerida' })
  expense_date!: string;

  /**
   * Optional receipt URL.
   * Must be a valid URL if provided.
   *
   * @type {string}
   */
  @ApiProperty({
    description: 'URL de la foto del recibo (opcional)',
    example: 'https://example.com/receipts/receipt123.jpg',
    type: String,
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'El receipt_url debe ser una cadena de texto' })
  @IsUrl({}, { message: 'El receipt_url debe ser una URL válida' })
  @MaxLength(500, {
    message: 'El receipt_url no puede exceder 500 caracteres',
  })
  receipt_url?: string;

  /**
   * Array of beneficiaries for this expense.
   * Must contain at least one beneficiary.
   * Each beneficiary can optionally specify amount_owed, otherwise it will be calculated as fair share.
   *
   * @type {CreateExpenseBeneficiaryDto[]}
   */
  @ApiProperty({
    description:
      'Lista de beneficiarios del gasto. Si no se especifica amount_owed, se calcula equitativamente',
    type: [CreateExpenseBeneficiaryDto],
    example: [
      { user_id: '123e4567-e89b-12d3-a456-426614174000' },
      { user_id: '223e4567-e89b-12d3-a456-426614174001', amount_owed: 75000.0 },
    ],
  })
  @IsArray({ message: 'Los beneficiarios deben ser un array' })
  @ArrayMinSize(1, {
    message: 'Debe haber al menos un beneficiario para el gasto',
  })
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseBeneficiaryDto)
  beneficiaries!: CreateExpenseBeneficiaryDto[];
}
