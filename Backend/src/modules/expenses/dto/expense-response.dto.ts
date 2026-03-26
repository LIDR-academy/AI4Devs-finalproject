import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for expense beneficiary in response.
 */
export class ExpenseBeneficiaryResponseDto {
  @ApiProperty({
    description: 'ID del usuario beneficiario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id!: string;

  @ApiProperty({
    description: 'Monto que debe pagar este beneficiario',
    example: 50000.0,
  })
  amount_owed!: number;
}

/**
 * DTO for expense response.
 * Contains all public fields of an expense.
 */
export class ExpenseResponseDto {
  @ApiProperty({
    description: 'ID único del gasto',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'ID del viaje al que pertenece el gasto',
    example: '223e4567-e89b-12d3-a456-426614174001',
  })
  trip_id!: string;

  @ApiProperty({
    description: 'ID del usuario que pagó el gasto',
    example: '323e4567-e89b-12d3-a456-426614174002',
  })
  payer_id!: string;

  @ApiProperty({
    description: 'ID de la categoría del gasto',
    example: 1,
  })
  category_id!: number;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Comida',
  })
  category_name!: string;

  @ApiProperty({
    description: 'Título del gasto',
    example: 'Cena en restaurante',
  })
  title!: string;

  @ApiProperty({
    description: 'Monto del gasto en COP',
    example: 150000.0,
  })
  amount!: number;

  @ApiProperty({
    description: 'URL de la foto del recibo (opcional)',
    example: 'https://example.com/receipts/receipt123.jpg',
    nullable: true,
  })
  receipt_url!: string | null;

  @ApiProperty({
    description: 'Fecha del gasto',
    example: '2024-01-15',
  })
  expense_date!: Date;

  @ApiProperty({
    description: 'Lista de beneficiarios del gasto',
    type: [ExpenseBeneficiaryResponseDto],
  })
  beneficiaries!: ExpenseBeneficiaryResponseDto[];

  @ApiProperty({
    description: 'Fecha de creación del gasto',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del gasto',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt!: Date;
}
