import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyMfaDto {
  @ApiProperty({
    description: 'Código TOTP de autenticación de dos factores',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'El código MFA es requerido' })
  @Length(6, 6, { message: 'El código MFA debe tener 6 dígitos' })
  code: string;

  @ApiProperty({
    description: 'Token de sesión temporal',
    example: 'temp-session-token',
  })
  @IsString()
  @IsNotEmpty({ message: 'El token de sesión es requerido' })
  sessionToken: string;
}
