import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';

/**
 * Módulo de Health Check.
 * Implementación del patrón CSED (Controller-Service-Entity-DTO).
 *
 * Estructura:
 * - Controller: Maneja las peticiones HTTP
 * - Service: Contiene la lógica de negocio
 *
 * Nota: Este módulo no requiere Entity ni DTO ya que solo retorna información
 * del estado de la aplicación sin acceso a base de datos.
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
