import { Injectable } from '@nestjs/common';

/**
 * Health Check Service.
 *
 * This service contains the business logic for health check operations.
 * It is responsible for gathering and returning the health status information
 * of the application, including status, timestamp, uptime, and environment.
 *
 * @class HealthService
 * @description Service for managing application health status
 * @example
 * // Injected in HealthController
 * constructor(private readonly healthService: HealthService) {}
 */
@Injectable()
export class HealthService {
  /**
   * Gets the health status of the application.
   *
   * This method collects various metrics about the application's current state,
   * including the operational status, current timestamp, system uptime, and
   * the current environment. This information is useful for monitoring and
   * debugging purposes.
   *
   * @method getHealthStatus
   * @returns {Object} Object containing the health status information
   * @returns {string} returns.status - Current status of the application (always 'ok')
   * @returns {string} returns.timestamp - ISO formatted current timestamp
   * @returns {number} returns.uptime - System uptime in seconds
   * @returns {string} returns.environment - Current Node.js environment (development, production, etc.)
   * @example
   * const healthStatus = healthService.getHealthStatus();
   * // Returns: {
   * //   status: 'ok',
   * //   timestamp: '2024-01-01T00:00:00.000Z',
   * //   uptime: 12345.67,
   * //   environment: 'development'
   * // }
   */
  getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
