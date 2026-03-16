import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DevLoginDto {
  @ApiProperty({
    description: 'Email del usuario (opcional en modo desarrollo)',
    example: 'dev@test.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Contraseña (opcional en modo desarrollo)',
    example: 'dev123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;
}
