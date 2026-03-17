import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for expense category in list responses.
 * Matches frontend ExpenseCategory type (id, name, icon, is_active).
 */
export class ExpenseCategoryResponseDto {
  @ApiProperty({ description: 'Category ID', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Category name', example: 'Comida' })
  name!: string;

  @ApiProperty({
    description: 'Icon identifier',
    example: 'comida',
    nullable: true,
  })
  icon!: string | null;

  @ApiProperty({ description: 'Whether the category is active', example: true })
  is_active!: boolean;
}
