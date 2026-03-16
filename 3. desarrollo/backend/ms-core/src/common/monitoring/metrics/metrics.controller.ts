import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('custom')
  getCustomMetrics() {
    return this.metricsService.getCustomMetrics();
  }

  @Get('health')
  getHealthMetrics() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      },
    };
  }
}
