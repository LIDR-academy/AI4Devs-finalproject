import { IsString, MinLength, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchActividadDto {
  @IsString({ message: 'La búsqueda debe ser texto' })
  @MinLength(3, { message: 'La búsqueda debe tener al menos 3 caracteres' })
  @ApiProperty({
    example: 'maiz',
    description: 'Texto de búsqueda (mínimo 3 caracteres)',
    minLength: 3
  })
  query: string;

  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite debe ser mayor a 0' })
  @Max(50, { message: 'El límite no puede exceder 50' })
  @ApiProperty({
    example: 20,
    description: 'Número máximo de resultados (máximo 50, por defecto 20)',
    default: 20,
    required: false,
    type: Number
  })
  limit?: number;
}

