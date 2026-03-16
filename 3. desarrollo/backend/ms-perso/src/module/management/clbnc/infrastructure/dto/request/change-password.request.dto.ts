import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para cambio de contraseña de usuario de banca digital (APP MÓVIL)
 * Este endpoint es llamado desde la aplicación móvil para cambiar la contraseña del usuario autenticado
 */
export class ChangePasswordRequestDto {
  @ApiProperty({
    description: 'Password actual del usuario (texto plano)',
    example: 'MiPasswordActual123!',
    maxLength: 128
  })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString({ message: 'La contraseña actual debe ser texto' })
  @MinLength(8, { message: 'La contraseña actual debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña actual no puede exceder 128 caracteres' })
  passwordActual: string;

  @ApiProperty({
    description: 'Nuevo password del usuario (texto plano)',
    example: 'MiNuevoPassword456!',
    maxLength: 128
  })
  @IsNotEmpty({ message: 'El nuevo password es requerido' })
  @IsString({ message: 'El nuevo password debe ser texto' })
  @MinLength(8, { message: 'El nuevo password debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'El nuevo password no puede exceder 128 caracteres' })
  passwordNuevo: string;
}

