import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../../../common/strategies/jwt.strategy';
import * as bcrypt from 'bcrypt';

/**
 * Service de Auth.
 * Responsabilidad: Contener la lógica de negocio relacionada con autenticación.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registra un nuevo usuario en el sistema y genera un token JWT automáticamente.
   * El usuario queda autenticado tras registrarse.
   *
   * @param registerDto - DTO con los datos del usuario a crear
   * @returns Entidad User y token JWT
   * @throws ConflictException si el email ya está registrado
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: User; accessToken: string }> {
    // Mapear RegisterDto a CreateUserDto
    const createUserDto: CreateUserDto = {
      nombre: registerDto.nombre,
      email: registerDto.email,
      contraseña: registerDto.contraseña,
    };

    // Crear el usuario usando el servicio de usuarios
    const user = await this.usersService.create(createUserDto);

    // Generar token JWT
    const accessToken = await this.generateToken(user);

    // Retornar entidad User y token
    return { user, accessToken };
  }

  /**
   * Autentica un usuario con email y contraseña.
   * Valida las credenciales y genera un token JWT.
   *
   * @param loginDto - DTO con email y contraseña
   * @returns Entidad User y token JWT
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(
    loginDto: LoginDto,
  ): Promise<{ user: User; accessToken: string }> {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);

    // Validar que el usuario exista
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Comparar contraseña proporcionada con el hash almacenado
    const isPasswordValid = await bcrypt.compare(
      loginDto.contraseña,
      user.passwordHash,
    );

    // Validar que la contraseña coincida
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar token JWT
    const accessToken = await this.generateToken(user);

    // Retornar entidad User y token
    return { user, accessToken };
  }

  /**
   * Genera un token JWT para un usuario.
   * Construye el payload con el ID y email del usuario.
   *
   * @param user - Entidad User para generar el token
   * @returns Token JWT firmado
   */
  private async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    return await this.jwtService.signAsync(payload);
  }
}
