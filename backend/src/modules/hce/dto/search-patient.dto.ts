import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchPatientDto {
  @ApiProperty({
    description: 'Buscar por nombre',
    example: 'Juan',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'Buscar por apellidos',
    example: 'Pérez',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Buscar por ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsUUID('4', { message: 'El ID debe ser un UUID válido' })
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Buscar por número de seguridad social (parcial)',
    example: '1234',
    required: false,
  })
  @IsString()
  @IsOptional()
  ssn?: string;
}
