import { ApiProperty } from '@nestjs/swagger';
import { ClbncResponseDto } from './clbnc.response.dto';

/**
 * DTO de respuesta para login de usuario de banca digital (APP MÓVIL)
 */
export class LoginResponseDto {
  @ApiProperty({
    type: ClbncResponseDto,
    description: 'Datos del usuario autenticado'
  })
  usuario: ClbncResponseDto;

  @ApiProperty({
    description: 'Token de sesión para autenticación en requests posteriores',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    maxLength: 64
  })
  tokenSesion: string;

  @ApiProperty({
    description: 'ID del cliente (para uso en la app móvil)',
    example: 123
  })
  clienteId: number;
}

