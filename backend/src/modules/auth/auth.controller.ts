import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'En modo desarrollo, si Keycloak no está disponible, genera un token de prueba automáticamente.'
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'string' },
        requiresMfa: { type: 'boolean' },
        devMode: { type: 'boolean', description: 'Indica si se usó modo desarrollo' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar código MFA' })
  @ApiResponse({
    status: 200,
    description: 'MFA verificado correctamente',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Código MFA inválido' })
  async verifyMfa(@Body() verifyMfaDto: VerifyMfaDto) {
    return this.authService.verifyMfa(verifyMfaDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar access token' })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado correctamente',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth("bearer")
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async logout(@CurrentUser() user: any) {
    return this.authService.logout(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        email: { type: 'string' },
        roles: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getProfile(@CurrentUser() user: any) {
    return {
      userId: user.userId,
      email: user.email,
      roles: user.roles,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('users')
  @Roles('cirujano', 'enfermeria', 'administrador')
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Listar usuarios (para asignación y visualización de personal)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con id, email y nombre' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getUsers() {
    return this.authService.getUsers();
  }
}
