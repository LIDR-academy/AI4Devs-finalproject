import {
  IsString,
  IsEmail,
  IsDateString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Nombre del paciente',
    example: 'Juan',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  firstName: string;

  @ApiProperty({
    description: 'Apellidos del paciente',
    example: 'Pérez García',
  })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son requeridos' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'Los apellidos no pueden exceder 100 caracteres' })
  lastName: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1985-05-15',
  })
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida' })
  dateOfBirth: string;

  @ApiProperty({
    description: 'Género',
    enum: ['M', 'F', 'Other'],
    example: 'M',
  })
  @IsEnum(['M', 'F', 'Other'], { message: 'El género debe ser M, F u Other' })
  @IsNotEmpty({ message: 'El género es requerido' })
  gender: string;

  @ApiProperty({
    description: 'Número de Seguridad Social (será encriptado)',
    example: '12345678A',
    required: false,
  })
  @IsString()
  @IsOptional()
  ssn?: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+34 600 123 456',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Dirección',
    example: 'Calle Principal 123, Madrid',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'paciente@ejemplo.com',
    required: false,
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  @IsOptional()
  email?: string;
}
