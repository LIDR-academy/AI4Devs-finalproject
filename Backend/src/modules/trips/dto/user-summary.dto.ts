import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para representar un resumen de usuario en respuestas de trips
 * Contiene solo información básica del usuario sin datos sensibles
 */
export class UserSummaryDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
  })
  email!: string;
}
