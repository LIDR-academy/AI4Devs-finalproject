import { IsString, IsEnum, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAllergyDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  patientId: string;

  @ApiProperty({
    description: 'Alérgeno',
    example: 'Penicilina',
  })
  @IsString()
  @IsNotEmpty({ message: 'El alérgeno es requerido' })
  allergen: string;

  @ApiProperty({
    description: 'Severidad de la alergia',
    enum: ['Low', 'Medium', 'High', 'Critical'],
    example: 'High',
  })
  @IsEnum(['Low', 'Medium', 'High', 'Critical'], {
    message: 'La severidad debe ser Low, Medium, High o Critical',
  })
  @IsNotEmpty({ message: 'La severidad es requerida' })
  severity: string;

  @ApiProperty({
    description: 'Notas adicionales',
    example: 'Reacción severa observada en 2020',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
