import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitud de recuperación de contraseña
 */
export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsString({ message: 'El correo electrónico debe ser texto' })
  email: string;
}

