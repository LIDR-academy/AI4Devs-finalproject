import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de información del usuario para respuesta
 */
export class UserInfoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid: string;

  @ApiProperty({ example: 'jperez' })
  username: string;

  @ApiProperty({ example: 'Juan Pérez' })
  nombreCompleto: string;

  @ApiProperty({ example: 'jperez@ejemplo.com', required: false })
  email?: string;

  @ApiProperty({ example: 1 })
  empresaId: number;

  @ApiProperty({ example: 1 })
  oficinaId: number;

  @ApiProperty({ example: 1 })
  perfilId: number;
}

/**
 * DTO de respuesta de login
 */
export class LoginResponseDto {
  @ApiProperty({
    description: 'Access token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  tokenType: 'Bearer';

  @ApiProperty({
    description: 'Información del usuario',
    type: UserInfoDto,
  })
  user: UserInfoDto;

  @ApiProperty({
    description: 'Indica si se requiere cambio de contraseña',
    example: false,
    required: false,
  })
  requirePasswordChange?: boolean;
}

