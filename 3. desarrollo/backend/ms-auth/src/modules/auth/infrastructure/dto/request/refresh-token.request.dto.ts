import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitud de refresh token
 */
export class RefreshTokenRequestDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  @IsString({ message: 'El refresh token debe ser texto' })
  refreshToken: string;
}

