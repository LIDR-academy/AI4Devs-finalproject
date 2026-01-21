import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta de sesión
 */
export class SessionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  uuid: string;

  @ApiProperty({ example: '192.168.1.1' })
  ipLogin: string;

  @ApiProperty({ example: 'Mozilla/5.0...', required: false })
  userAgent?: string;

  @ApiProperty({ example: 'Mi Computadora', required: false })
  deviceName?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  fechaCreacion: Date;

  @ApiProperty({ example: '2024-01-22T10:30:00Z' })
  fechaExpiracion: Date;

  @ApiProperty({ example: '2024-01-15T14:30:00Z' })
  fechaUltimaActividad: Date;

  @ApiProperty({ example: true })
  activo: boolean;
}

