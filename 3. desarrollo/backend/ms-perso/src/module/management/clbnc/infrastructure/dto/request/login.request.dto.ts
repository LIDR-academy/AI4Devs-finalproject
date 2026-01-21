import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber, IsEmail } from 'class-validator';

/**
 * DTO para login de usuario de banca digital (APP MÓVIL)
 * Este endpoint es llamado desde la aplicación móvil para autenticar usuarios
 */
export class LoginRequestDto {
  @ApiProperty({
    description: 'Username del usuario (email o cédula)',
    example: 'usuario@email.com',
    maxLength: 150
  })
  @IsNotEmpty({ message: 'El username es requerido' })
  @IsString({ message: 'El username debe ser texto' })
  @MaxLength(150, { message: 'El username no puede exceder 150 caracteres' })
  username: string;

  @ApiProperty({
    description: 'Password del usuario (texto plano)',
    example: 'MiPassword123!',
    maxLength: 128
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  password: string;

  @ApiProperty({
    description: 'IMEI del dispositivo móvil',
    example: '123456789012345',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString({ message: 'El IMEI debe ser texto' })
  @MaxLength(100, { message: 'El IMEI no puede exceder 100 caracteres' })
  imei?: string | null;

  @ApiProperty({
    description: 'Nombre del dispositivo',
    example: 'iPhone 13 Pro',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString({ message: 'El nombre del dispositivo debe ser texto' })
  @MaxLength(150, { message: 'El nombre del dispositivo no puede exceder 150 caracteres' })
  nombreDispositivo?: string | null;

  @ApiProperty({
    description: 'Detalles del dispositivo (user agent, modelo)',
    example: 'iOS 15.0 / iPhone 13 Pro',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString({ message: 'Los detalles del dispositivo deben ser texto' })
  @MaxLength(250, { message: 'Los detalles del dispositivo no pueden exceder 250 caracteres' })
  detallesDispositivo?: string | null;

  @ApiProperty({
    description: 'Dirección IP del dispositivo',
    example: '192.168.1.100',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString({ message: 'La IP debe ser texto' })
  @MaxLength(50, { message: 'La IP no puede exceder 50 caracteres' })
  ip?: string | null;

  @ApiProperty({
    description: 'Latitud GPS del dispositivo',
    example: -0.180653,
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  latitud?: number | null;

  @ApiProperty({
    description: 'Longitud GPS del dispositivo',
    example: -78.467834,
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  longitud?: number | null;

  @ApiProperty({
    description: 'Dirección geocodificada desde GPS',
    example: 'Av. Amazonas N34-123, Quito',
    required: false,
    nullable: true
  })
  @IsOptional()
  @IsString({ message: 'El geocoder debe ser texto' })
  @MaxLength(250, { message: 'El geocoder no puede exceder 250 caracteres' })
  geocoder?: string | null;
}

