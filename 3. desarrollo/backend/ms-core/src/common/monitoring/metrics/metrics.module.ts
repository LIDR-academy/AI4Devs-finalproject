import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsInterceptor } from './metrics.interceptor';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: false, // Deshabilitar métricas por defecto del PrometheusModule
        config: {
          prefix: 'core_nest_',
        },
      },
    }),
  ],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  controllers: [MetricsController],
  exports: [MetricsService],
})
export class MetricsModule {}
