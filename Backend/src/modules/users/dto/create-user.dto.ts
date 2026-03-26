import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for creating a new user.
 * Contains all necessary validations for user registration input fields.
 *
 * @class CreateUserDto
 * @description This DTO is used to validate and structure user registration data
 * before it is processed by the user service. All fields are required and validated
 * according to their respective constraints.
 */
export class CreateUserDto {
  /**
   * User's full name.
   * Must be a non-empty string.
   *
   * @type {string}
   * @memberof CreateUserDto
   * @example "Juan Pérez"
   */
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan Pérez',
    type: String,
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  /**
   * User's email address.
   * Must be a valid email format and non-empty.
   *
   * @type {string}
   * @memberof CreateUserDto
   * @example "juan.perez@example.com"
   */
  @ApiProperty({
    description: 'Email del usuario (debe ser un formato válido)',
    example: 'juan.perez@example.com',
    type: String,
  })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  /**
   * User's password.
   * Must be a string with a minimum length of 8 characters.
   *
   * @type {string}
   * @memberof CreateUserDto
   * @example "miPassword123"
   * @minLength 8
   */
  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'miPassword123',
    type: String,
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contraseña!: string;
}
