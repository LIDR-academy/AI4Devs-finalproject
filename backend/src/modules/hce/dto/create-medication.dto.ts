import {
  IsString,
  IsDateString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty({
    description: 'ID del paciente',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del paciente debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del paciente es requerido' })
  patientId: string;

  @ApiProperty({
    description: 'Nombre del medicamento',
    example: 'Paracetamol',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del medicamento es requerido' })
  name: string;

  @ApiProperty({
    description: 'Dosis',
    example: '500mg',
  })
  @IsString()
  @IsNotEmpty({ message: 'La dosis es requerida' })
  dosage: string;

  @ApiProperty({
    description: 'Frecuencia',
    example: 'Cada 8 horas',
  })
  @IsString()
  @IsNotEmpty({ message: 'La frecuencia es requerida' })
  frequency: string;

  @ApiProperty({
    description: 'Fecha de inicio',
    example: '2024-01-15',
  })
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin (opcional)',
    example: '2024-02-15',
    required: false,
  })
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsOptional()
  endDate?: string;
}
