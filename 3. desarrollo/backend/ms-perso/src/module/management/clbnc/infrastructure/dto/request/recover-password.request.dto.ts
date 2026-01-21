import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

/**
 * DTO para iniciar recuperación de contraseña (APP MÓVIL)
 * Este endpoint es llamado desde la aplicación móvil cuando el usuario olvida su contraseña
 */
export class IniciarRecuperacionPasswordRequestDto {
  @ApiProperty({
    description: 'Username del usuario (email o cédula)',
    example: 'usuario@email.com',
    maxLength: 150
  })
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser texto' })
  @MaxLength(150, { message: 'El username no puede exceder 150 caracteres' })
  username: string;
}

/**
 * DTO para completar recuperación de contraseña (APP MÓVIL)
 * Este endpoint es llamado desde la aplicación móvil después de validar el código de verificación
 */
export class CompletarRecuperacionPasswordRequestDto {
  @ApiProperty({
    description: 'Username del usuario (email o cédula)',
    example: 'usuario@email.com',
    maxLength: 150
  })
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser texto' })
  @MaxLength(150, { message: 'El username no puede exceder 150 caracteres' })
  username: string;

  @ApiProperty({
    description: 'Código de verificación recibido por email/SMS',
    example: '123456',
    minLength: 6,
    maxLength: 6
  })
  @IsNotEmpty({ message: 'El código de verificación es requerido' })
  @IsString({ message: 'El código de verificación debe ser texto' })
  @MinLength(6, { message: 'El código de verificación debe tener 6 dígitos' })
  @MaxLength(6, { message: 'El código de verificación debe tener 6 dígitos' })
  codigoVerificacion: string;

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

