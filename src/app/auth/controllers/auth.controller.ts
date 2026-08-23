import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto, AuthResponseDto } from '../dtos';
import { JwtGuard } from '@shared/security/guards/jwt.guard';

interface AuthRequest extends Request {
  user?: {
    sub: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(204)
  async logout(): Promise<void> {
    return;
  }

  @Post('members/:memberId/password')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: AuthRequest,
  ): Promise<{ message: string }> {
    if (!req.user?.sub) {
      throw new BadRequestException('User not authenticated');
    }

    await this.authService.changePassword(
      req.user.sub,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return { message: 'Password changed successfully' };
  }
}
