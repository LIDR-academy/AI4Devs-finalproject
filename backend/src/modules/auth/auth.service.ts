import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nombre } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El correo ya está registrado');
    }

    try {
      const salt = await bcrypt.genSalt();
      const password_hash = await bcrypt.hash(password, salt);

      const user = await this.prisma.user.create({
        data: {
          email,
          password_hash,
          nombre,
        },
      });

      return {
        access_token: this.generateToken(user.id),
        user: { id: user.id, email: user.email, nombre: user.nombre },
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      if (!user.activo) {
        throw new UnauthorizedException('Cuenta desactivada');
      }

      return {
        access_token: this.generateToken(user.id),
        user: { id: user.id, email: user.email, nombre: user.nombre },
      };
    }

    throw new UnauthorizedException('Credenciales incorrectas');
  }

  private generateToken(userId: string) {
    const payload = { sub: userId };
    return this.jwtService.sign(payload);
  }
}
