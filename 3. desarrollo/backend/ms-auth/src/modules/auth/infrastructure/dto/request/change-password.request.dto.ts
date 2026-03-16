import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitud de cambio de contraseña
 */
export class ChangePasswordRequestDto {
  @ApiProperty({
    description: 'Contraseña actual',
    example: '********',
  })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  @IsString({ message: 'La contraseña actual debe ser texto' })
  currentPassword: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    example: '********',
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
  newPassword: string;

  @ApiProperty({
    description: 'Confirmación de nueva contraseña',
    example: '********',
  })
  @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
  @IsString({ message: 'La confirmación de contraseña debe ser texto' })
  confirmPassword: string;
}

