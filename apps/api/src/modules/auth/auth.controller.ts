import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
} from '../../common/constants/auth.constants';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  isMobileClient,
  resolveRefreshToken,
} from './utils/mobile-client.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.login(dto);
    this.setRefreshCookie(response, refreshToken);
    if (isMobileClient(request.headers as Record<string, unknown>)) {
      return { ...result, refreshToken };
    }
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto = {},
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const cookieToken = request.cookies?.[REFRESH_COOKIE_NAME] as
      | string
      | undefined;
    const refreshToken = resolveRefreshToken(cookieToken, dto.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const { refreshToken: rotatedRefreshToken, ...result } =
      await this.authService.refresh(refreshToken);
    this.setRefreshCookie(response, rotatedRefreshToken);
    if (
      dto.refreshToken?.trim() ||
      isMobileClient(request.headers as Record<string, unknown>)
    ) {
      return { ...result, refreshToken: rotatedRefreshToken };
    }
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.authService.logout(user.userId);
    this.clearRefreshCookie(response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.userId);
  }

  private setRefreshCookie(response: Response, refreshToken: string): void {
    response.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
      maxAge: this.authService.getRefreshCookieMaxAgeMs(),
    });
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: REFRESH_COOKIE_PATH,
    });
  }
}
