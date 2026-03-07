import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  ParseUUIDPipe,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { UserMapper } from '../../../common/mappers/user.mapper';
import type { AuthenticatedRequest } from '../../../common/interfaces/authenticated-request.interface';

/**
 * Controller de Users.
 *
 * Este controlador maneja las peticiones HTTP relacionadas con la gestión de usuarios.
 * Su responsabilidad principal es manejar peticiones HTTP y validaciones de entrada,
 * delegando toda la lógica de negocio al UsersService.
 *
 * NOTA: El registro de usuarios se maneja en AuthController (POST /auth/register).
 * Este controller solo maneja operaciones de gestión: consultar, actualizar y eliminar.
 *
 * @class UsersController
 * @description Controlador para gestionar usuarios
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  /**
   * Crea una instancia del UsersController.
   *
   * @constructor
   * @param {UsersService} usersService - Servicio inyectado para gestionar usuarios
   */
  constructor(private readonly usersService: UsersService) {}

  /**
   * Obtiene todos los usuarios activos del sistema.
   *
   * @method findAll
   * @returns {UserResponseDto[]} Lista de usuarios activos
   * @example
   * // GET /users
   * // Respuesta: [{ id: "...", nombre: "...", email: "...", createdAt: "..." }, ...]
   */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();

    // Mapear entidades a DTOs de respuesta (sin información sensible)
    return users.map((user) => UserMapper.toResponseDto(user));
  }

  /**
   * Obtiene un usuario por su ID.
   *
   * @method findOne
   * @param {string} id - ID del usuario a buscar
   * @returns {UserResponseDto} Usuario encontrado
   * @example
   * // GET /users/:id
   * // Respuesta: { id: "...", nombre: "...", email: "...", createdAt: "..." }
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);

    // Mapear entidad a DTO de respuesta (sin información sensible)
    return UserMapper.toResponseDto(user);
  }

  /**
   * Actualiza un usuario existente.
   *
   * Este método maneja las peticiones PUT al endpoint /users/:id y delega
   * la actualización al UsersService. Permite actualizaciones parciales.
   *
   * @method update
   * @param {string} id - ID del usuario a actualizar
   * @param {UpdateUserDto} updateUserDto - DTO con los datos a actualizar
   * @returns {UserResponseDto} Usuario actualizado
   * @example
   * // PUT /users/:id
   * // Body: { nombre: "Nuevo Nombre", email: "nuevo@example.com" }
   * // Respuesta: { id: "...", nombre: "Nuevo Nombre", email: "nuevo@example.com", createdAt: "..." }
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario existente' })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a actualizar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Datos de entrada inválidos o ID inválido (debe ser un UUID válido)',
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  @ApiConflictResponse({
    description: 'El email ya está registrado por otro usuario',
  })
  @ApiForbiddenResponse({
    description: 'No tienes permisos para actualizar este usuario',
  })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserResponseDto> {
    // Verificar autorización: usuarios solo pueden actualizar su propio perfil
    if (req.user?.id !== id) {
      throw new ForbiddenException('Solo puedes actualizar tu propio perfil');
    }

    const user = await this.usersService.update(id, updateUserDto);

    // Mapear entidad a DTO de respuesta (sin información sensible)
    return UserMapper.toResponseDto(user);
  }

  /**
   * Elimina un usuario de forma lógica (soft delete).
   *
   * Este método maneja las peticiones DELETE al endpoint /users/:id y delega
   * la eliminación al UsersService. El usuario no se elimina físicamente,
   * solo se marca como eliminado (soft delete).
   *
   * @method remove
   * @param {string} id - ID del usuario a eliminar
   * @returns {void}
   * @example
   * // DELETE /users/:id
   * // Respuesta: 204 No Content
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiNotFoundResponse({
    description: 'Usuario no encontrado',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
