import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para actualizar un usuario existente.
 * Todos los campos son opcionales para permitir actualizaciones parciales.
 */
export class UpdateUserDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({
    description: 'Email del usuario (debe ser un formato válido)',
    example: 'juan.perez@example.com',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email?: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario (mínimo 8 caracteres)',
    example: 'miPassword123',
    type: String,
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contraseña?: string;
}
