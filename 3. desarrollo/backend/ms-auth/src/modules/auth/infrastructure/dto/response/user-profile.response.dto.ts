import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta del perfil de usuario
 */
export class UserProfileResponseDto {
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

  @ApiProperty({ example: 'EMPLEADO' })
  tipoUsuario: string;

  @ApiProperty({ example: false })
  esAdmin: boolean;

  @ApiProperty({ example: false })
  accesoGlobal: boolean;

  @ApiProperty({ example: false })
  mfaActivado: boolean;
}

