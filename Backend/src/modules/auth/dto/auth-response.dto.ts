import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

/**
 * DTO para la respuesta de autenticación.
 * Incluye el token JWT y los datos del usuario.
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  readonly accessToken: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    type: UserResponseDto,
  })
  readonly user: UserResponseDto;

  constructor(accessToken: string, user: UserResponseDto) {
    this.accessToken = accessToken;
    this.user = user;
  }
}
