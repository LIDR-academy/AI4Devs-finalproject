import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { MetricsService } from "../../common/metrics/metrics.service";
import { UsersService } from "../users/users.service";
import { UpdateProfileDto } from "../users/dto/update-profile.dto";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import type { JwtPayload } from "./types/jwt-payload.type";

@Injectable()
export class AuthService {
  private static readonly SALT_ROUNDS = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly metrics: MetricsService,
  ) {}

  async register(credentials: AuthCredentialsDto) {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const existingUser = await this.usersService.findByEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException("Email is already in use");
    }

    const passwordHash = await bcrypt.hash(
      credentials.password,
      AuthService.SALT_ROUNDS,
    );

    const user = await this.usersService.createUser(normalizedEmail, passwordHash);

    return this.buildAuthResponse(user);
  }

  async login(credentials: AuthCredentialsDto) {
    const normalizedEmail = credentials.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      this.metrics.increment("login_failure");
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      this.metrics.increment("login_failure");
      throw new UnauthorizedException("Invalid email or password");
    }

    this.metrics.increment("login_success");

    return this.buildAuthResponse(user);
  }

  async me(userId: string): Promise<ProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    return this.toProfileResponse(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponse> {
    const updatedUser = await this.usersService.updateProfile(userId, dto);
    return this.toProfileResponse(updatedUser);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isCurrentPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, AuthService.SALT_ROUNDS);
    await this.usersService.updatePassword(userId, newPasswordHash);
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersService.deleteUser(userId);
  }

  private toProfileResponse(user: User): ProfileResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      address: user.address,
      createdAt: user.createdAt,
    };
  }

  private buildAuthResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.toProfileResponse(user),
    };
  }
}

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  age: number | null;
  address: string | null;
  createdAt: Date;
}
