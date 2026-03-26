import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { UserMapper } from '../../../common/mappers/user.mapper';

/**
 * Controller de Auth.
 *
 * Este controlador maneja las peticiones HTTP relacionadas con autenticación.
 * Su responsabilidad principal es manejar peticiones HTTP y validaciones de entrada,
 * delegando toda la lógica de negocio al AuthService.
 *
 * @class AuthController
 * @description Controlador para gestionar autenticación
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Crea una instancia del AuthController.
   *
   * @constructor
   * @param {AuthService} authService - Servicio inyectado para gestionar autenticación
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Autentica un usuario con email y contraseña.
   *
   * Este método maneja las peticiones POST al endpoint /auth/login y delega
   * la autenticación al AuthService. Retorna un token JWT si las credenciales son válidas.
   *
   * @method login
   * @param {LoginDto} loginDto - DTO con email y contraseña
   * @returns {AuthResponseDto} Token JWT y datos del usuario
   * @example
   * // POST /auth/login
   * // Body: { email: "juan@example.com", contraseña: "password123" }
   * // Respuesta: { accessToken: "...", user: { id: "...", nombre: "...", email: "...", createdAt: "..." } }
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar usuario y obtener token JWT' })
  @ApiResponse({
    status: 200,
    description: 'Autenticación exitosa',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos (validación fallida)',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const { user, accessToken } = await this.authService.login(loginDto);
    const userResponse = UserMapper.toResponseDto(user);
    return new AuthResponseDto(accessToken, userResponse);
  }

  /**
   * Registra un nuevo usuario en el sistema y genera un token JWT automáticamente.
   *
   * Este método maneja las peticiones POST al endpoint /auth/register y delega
   * la creación del usuario al AuthService. El usuario queda autenticado tras registrarse,
   * recibiendo un token JWT que puede usar inmediatamente.
   *
   * @method register
   * @param {RegisterDto} registerDto - DTO con los datos del usuario a crear
   * @returns {AuthResponseDto} Token JWT y datos del usuario (sin información sensible)
   * @example
   * // POST /auth/register
   * // Body: { nombre: "Juan Pérez", email: "juan@example.com", contraseña: "password123" }
   * // Respuesta: { accessToken: "...", user: { id: "...", nombre: "Juan Pérez", email: "juan@example.com", createdAt: "..." } }
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar un nuevo usuario y obtener token JWT' })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado exitosamente y autenticado automáticamente',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos (validación fallida)',
  })
  @ApiConflictResponse({
    description: 'El email ya está registrado',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { user, accessToken } = await this.authService.register(registerDto);
    const userResponse = UserMapper.toResponseDto(user);
    return new AuthResponseDto(accessToken, userResponse);
  }
}
