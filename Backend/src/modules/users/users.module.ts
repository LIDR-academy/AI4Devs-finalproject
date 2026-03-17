import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { User } from './entities/user.entity';

/**
 * Módulo de Users.
 *
 * Este módulo gestiona las operaciones CRUD de usuarios (excepto creación, que se maneja en AuthModule).
 *
 * Estructura (Patrón CSED):
 * - Controller: Maneja las peticiones HTTP de gestión de usuarios (GET, PUT, DELETE)
 * - Service: Contiene la lógica de negocio y acceso a datos mediante TypeORM
 * - Entity: Define el modelo de datos de User
 * - DTO: Define los contratos de validación y respuesta de la API
 *
 * Endpoints:
 * - GET /users - Obtener todos los usuarios activos
 * - GET /users/:id - Obtener un usuario por ID
 * - PUT /users/:id - Actualizar un usuario
 * - DELETE /users/:id - Eliminar un usuario (soft delete)
 *
 * NOTA: El registro de usuarios (POST) se maneja en AuthModule (POST /auth/register).
 * Este módulo también es utilizado por AuthModule para:
 * - Crear usuarios durante el registro (a través de UsersService)
 * - Buscar usuarios durante el login (a través de UsersService)
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
