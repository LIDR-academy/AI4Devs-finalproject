import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

/**
 * Service de Users.
 * Responsabilidad: Contener la lógica de negocio y acceso a datos mediante TypeORM.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo usuario en el sistema.
   * Valida que el email no esté duplicado y hashea la contraseña.
   *
   * @param createUserDto - DTO con los datos del usuario a crear
   * @returns Usuario creado (sin la contraseña)
   * @throws ConflictException si el email ya existe
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el email ya existe (excluyendo usuarios eliminados)
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email, deletedAt: IsNull() },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(
      createUserDto.contraseña,
      saltRounds,
    );

    // Crear la entidad User
    const user = new User();
    user.nombre = createUserDto.nombre;
    user.email = createUserDto.email;
    user.passwordHash = passwordHash;

    // Guardar en la base de datos
    return await this.userRepository.save(user);
  }

  /**
   * Obtiene todos los usuarios activos del sistema.
   *
   * @returns Lista de usuarios activos (sin información sensible)
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { deletedAt: IsNull() },
    });
  }

  /**
   * Obtiene un usuario por su ID.
   *
   * @param id - ID del usuario a buscar
   * @returns Usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Busca un usuario por su email.
   *
   * @param email - Email del usuario a buscar
   * @returns Usuario encontrado o null si no existe
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /**
   * Actualiza un usuario existente.
   * Valida que el email no esté duplicado (si se actualiza) y hashea la contraseña (si se actualiza).
   *
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - DTO con los datos a actualizar
   * @returns Usuario actualizado
   * @throws NotFoundException si el usuario no existe
   * @throws ConflictException si el email ya está en uso por otro usuario
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Verificar que el usuario existe (excluyendo usuarios eliminados)
    const existingUser = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se actualiza el email, verificar que no esté duplicado (excluyendo usuarios eliminados)
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email, deletedAt: IsNull() },
      });
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Preparar datos para actualizar
    if (updateUserDto.nombre !== undefined) {
      existingUser.nombre = updateUserDto.nombre;
    }

    if (updateUserDto.email !== undefined) {
      existingUser.email = updateUserDto.email;
    }

    // Si se actualiza la contraseña, validar y hashearla
    if (updateUserDto.contraseña !== undefined) {
      // Validar que la contraseña no esté vacía
      if (updateUserDto.contraseña === '') {
        throw new BadRequestException(
          'La contraseña no puede estar vacía. Debe tener al menos 8 caracteres.',
        );
      }
      // Validar longitud mínima (el DTO ya valida esto, pero agregamos validación adicional)
      if (updateUserDto.contraseña.length < 8) {
        throw new BadRequestException(
          'La contraseña debe tener al menos 8 caracteres',
        );
      }
      const saltRounds = 10;
      existingUser.passwordHash = await bcrypt.hash(
        updateUserDto.contraseña,
        saltRounds,
      );
    }

    // Actualizar el usuario
    return await this.userRepository.save(existingUser);
  }

  /**
   * Elimina un usuario de forma lógica (soft delete).
   *
   * @param id - ID del usuario a eliminar
   * @throws NotFoundException si el usuario no existe
   */
  async remove(id: string): Promise<void> {
    // Eliminar de forma lógica (soft delete)
    const result = await this.userRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
