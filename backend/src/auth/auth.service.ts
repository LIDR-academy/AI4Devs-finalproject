import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type PublicUser = Pick<User, 'id' | 'email' | 'name'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: PublicUser }> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email, name: dto.name.trim(), passwordHash },
    });
    return this.authResponse(user);
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: PublicUser }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.authResponse(user);
  }

  async getPublicUser(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User session is no longer valid');
    }
    return this.toPublicUser(user);
  }

  private authResponse(user: User): { accessToken: string; user: PublicUser } {
    return {
      accessToken: this.jwtService.sign({ id: user.id, email: user.email }),
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(user: User): PublicUser {
    return { id: user.id, email: user.email, name: user.name };
  }
}
