import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from '../services/health.service';

/**
 * Controller de Health Check.
 *
 * Este controlador maneja las peticiones HTTP relacionadas con el estado de salud
 * de la aplicación. Su responsabilidad principal es manejar peticiones HTTP y
 * validaciones de entrada, delegando toda la lógica de negocio al HealthService.
 *
 * @class HealthController
 * @description Controlador para verificar el estado de salud de la aplicación
 * @example
 * // El endpoint está disponible en GET /health
 * // Retorna el estado actual de la aplicación
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  /**
   * Crea una instancia del HealthController.
   *
   * @constructor
   * @param {HealthService} healthService - Servicio inyectado para obtener el estado de salud
   */
  constructor(private readonly healthService: HealthService) {}

  /**
   * Verifica el estado de salud de la aplicación.
   *
   * Este método maneja las peticiones GET al endpoint /health y delega
   * la obtención del estado de salud al HealthService. No contiene lógica
   * de negocio, solo actúa como intermediario entre la petición HTTP y el servicio.
   *
   * @method check
   * @returns {Object} Objeto con el estado de salud de la aplicación
   * @example
   * // GET /health
   * // Respuesta: { status: 'ok', timestamp: '2024-01-01T00:00:00.000Z' }
   */
  @Get()
  @ApiOperation({ summary: 'Verificar el estado de la aplicación' })
  @ApiResponse({
    status: 200,
    description: 'Aplicación funcionando correctamente',
  })
  check() {
    // El controller solo delega al service
    return this.healthService.getHealthStatus();
  }
}
