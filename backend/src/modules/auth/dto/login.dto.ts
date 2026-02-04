import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({
    description: 'Email del usuario (alternativa: usar username)',
    example: 'cirujano@hospital.com',
  })
  @ValidateIf((o) => o.email !== undefined && o.email !== '')
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Username (en dev se usa como email si email no viene)',
    example: 'ana@hospital.com',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
