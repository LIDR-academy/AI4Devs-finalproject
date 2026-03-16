import { Controller} from '@nestjs/common';
import { PgService } from '../database/pg.config';
import { LoggerService } from '../log/logger.service';
import { envs } from 'src/common';
import { GeneralConstant } from 'src/common/config/constant';
import { MessagePattern } from '@nestjs/microservices';
import { HealthEnum } from './enum';

@Controller(HealthEnum.msService)
export class HealthContext {
  private readonly logger = new LoggerService();

  constructor(private readonly pgService: PgService) { }

  @MessagePattern({ sm: HealthEnum.smPersonHealth })
  info() {
    return {
      service: GeneralConstant.appAbr,
      version: GeneralConstant.appVersion || '0.0.1',
      description: GeneralConstant.appDescription,
      endpoints: {
        info: '/health',
        ready: '/health/ready',
        db: '/health/db',
      },
      dependencies: {
        nats: 'required',
        database: 'required'
      },
      database: {
        host: envs.db.host,
        port: envs.db.port,
        name: envs.db.name,
        ssl: envs.db.ssl
      }
    };
  }

  @MessagePattern({ sm: HealthEnum.smPersonReady })
  async healthCheck() {
    try {
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: GeneralConstant.appAbr,
        version: GeneralConstant.appVersion || '0.0.1',
        environment: envs.nodeEnv || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        description: GeneralConstant.appDescription
      };

      this.logger.log('Comprobación del estado del endpoint: Exitosa', 'HealthController');

      return healthData;
    } catch (error) {
      this.logger.error('Comprobación del estado del endpoint: Fallida', error.stack, 'HealthController');

      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: GeneralConstant.appAbr,
        error: 'Comprobación ha fallado',
      };
    }
  }

  @MessagePattern({ sm: HealthEnum.smPersonDB })
  async databaseHealthCheck() {
    try {
      this.logger.log('Se inició la comprobación del estado de la base de datos', 'HealthController');
      const isHealthy = await this.pgService.healthCheck();

      if (isHealthy) {
        const poolStats = this.pgService.getPoolStats();

        const healthData = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: GeneralConstant.appAbr,
          database: 'connected',
          pool_stats: poolStats,
          message: 'Conexión exitosa a la base de datos',
          description: GeneralConstant.appDescription,

        };

        this.logger.log('Comprobación del estado de la base de datos: Exitosa', 'HealthController');

        return healthData;
      } else {
        this.logger.error('Comprobación del estado de la base de datos: Fallida', 'HealthController');

        return {
          status: 'error',
          timestamp: new Date().toISOString(),
          service: GeneralConstant.appAbr,
          database: 'disconnected',
          error: 'Conexión a la base de datos fallida',
          message: 'No se pudo conectar a la base de datos vía PgBouncer',
        };
      }
    } catch (error) {
      this.logger.error('Comprobación del estado de la base de datos: Fallida', error.stack, 'HealthController');

      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: GeneralConstant.appAbr,
        database: 'error',
        error: error.message,
        message: 'Error al verificar la conexión de base de datos',
      };
    }
  }
}
