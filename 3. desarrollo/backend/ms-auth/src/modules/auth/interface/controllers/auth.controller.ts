import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Public } from '../../../../common/decorators/public.decorator';
import { LoginUseCase } from '../../application/usecases/login.usecase';
import { RefreshTokenUseCase } from '../../application/usecases/refresh-token.usecase';
import { LogoutUseCase } from '../../application/usecases/logout.usecase';
import { LogoutAllUseCase } from '../../application/usecases/logout-all.usecase';
import { ChangePasswordUseCase } from '../../application/usecases/change-password.usecase';
import { GetProfileUseCase } from '../../application/usecases/get-profile.usecase';
import { GetSessionsUseCase } from '../../application/usecases/get-sessions.usecase';
import { RevokeSessionUseCase } from '../../application/usecases/revoke-session.usecase';
import { ForgotPasswordUseCase } from '../../application/usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from '../../application/usecases/reset-password.usecase';
import { LoginRequestDto } from '../../infrastructure/dto/request/login.request.dto';
import { RefreshTokenRequestDto } from '../../infrastructure/dto/request/refresh-token.request.dto';
import { ChangePasswordRequestDto } from '../../infrastructure/dto/request/change-password.request.dto';
import { ForgotPasswordRequestDto } from '../../infrastructure/dto/request/forgot-password.request.dto';
import { ResetPasswordRequestDto } from '../../infrastructure/dto/request/reset-password.request.dto';
import { LoginResponseDto } from '../../infrastructure/dto/response/login.response.dto';
import { UserProfileResponseDto } from '../../infrastructure/dto/response/user-profile.response.dto';
import { SessionResponseDto } from '../../infrastructure/dto/response/session.response.dto';
import { TokenPayload } from '../../infrastructure/services/jwt-token.service';
import { ClientInfo } from '../../infrastructure/interfaces/client-info.interface';

/**
 * Controlador REST para autenticación
 * Nota: En producción, estos endpoints deberían estar solo en MS-CORE (API Gateway)
 */
@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly logoutAllUseCase: LogoutAllUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly getSessionsUseCase: GetSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  /**
   * Extrae información del cliente del request
   */
  private extractClientInfo(@Req() req: any): ClientInfo {
    return {
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      deviceFingerprint: req.headers['x-device-fingerprint'],
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: any,
  ): Promise<LoginResponseDto> {
    const clientInfo = this.extractClientInfo(req);
    return this.loginUseCase.execute(dto, clientInfo);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso' })
  @ApiResponse({
    status: 200,
    description: 'Tokens refrescados exitosamente',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token de refresco inválido' })
  async refresh(@Body() dto: RefreshTokenRequestDto): Promise<LoginResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@CurrentUser() user: TokenPayload): Promise<{ success: boolean }> {
    await this.logoutUseCase.execute(user);
    return { success: true };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar todas las sesiones' })
  @ApiResponse({
    status: 200,
    description: 'Todas las sesiones cerradas',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        sessionsRevoked: { type: 'number' },
      },
    },
  })
  async logoutAll(
    @CurrentUser() user: TokenPayload,
  ): Promise<{ success: boolean; sessionsRevoked: number }> {
    const result = await this.logoutAllUseCase.execute(user);
    return { success: true, ...result };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  async changePassword(
    @CurrentUser() user: TokenPayload,
    @Body() dto: ChangePasswordRequestDto,
  ): Promise<{ success: boolean }> {
    await this.changePasswordUseCase.execute(dto, user);
    return { success: true };
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiResponse({
    status: 200,
    description: 'Si el correo existe, se enviarán instrucciones',
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordRequestDto,
    @Req() req: any,
  ): Promise<{ success: boolean; message: string }> {
    const clientInfo = this.extractClientInfo(req);
    return this.forgotPasswordUseCase.execute(dto, clientInfo);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 400, description: 'Error de validación' })
  async resetPassword(
    @Body() dto: ResetPasswordRequestDto,
  ): Promise<{ success: boolean }> {
    await this.resetPasswordUseCase.execute(dto);
    return { success: true };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: UserProfileResponseDto,
  })
  async getProfile(
    @CurrentUser() user: TokenPayload,
  ): Promise<UserProfileResponseDto> {
    return this.getProfileUseCase.execute(user);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener sesiones activas del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de sesiones activas',
    type: [SessionResponseDto],
  })
  async getSessions(
    @CurrentUser() user: TokenPayload,
  ): Promise<SessionResponseDto[]> {
    return this.getSessionsUseCase.execute(user);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revocar una sesión específica' })
  @ApiResponse({ status: 200, description: 'Sesión revocada exitosamente' })
  @ApiResponse({ status: 404, description: 'Sesión no encontrada' })
  async revokeSession(
    @CurrentUser() user: TokenPayload,
    @Param('sessionId') sessionId: string,
  ): Promise<{ success: boolean }> {
    await this.revokeSessionUseCase.execute(user, sessionId);
    return { success: true };
  }
}

