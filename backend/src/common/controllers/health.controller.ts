import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Información de la API' })
  @ApiResponse({
    status: 200,
    description: 'Información de la API',
  })
  getInfo() {
    return {
      name: 'SIGQ API',
      description: 'Sistema Integrado de Gestión Quirúrgica - Backend API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
        health: '/api/v1/health',
        auth: '/api/v1/auth',
        swagger: '/api/docs',
      },
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando correctamente',
  })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Public()
  @Get('api/v1/health')
  @ApiOperation({ summary: 'Health check (con prefijo)' })
  @ApiResponse({
    status: 200,
    description: 'API está funcionando correctamente',
  })
  healthWithPrefix() {
    return this.health();
  }
}
