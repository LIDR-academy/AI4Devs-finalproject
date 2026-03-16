import { Module } from '@nestjs/common';
import { AuthModule } from './module/ms-auth/module';
import { MsPersoModule } from './module/ms-perso/module';
import { MetricsModule } from './common/monitoring/metrics/metrics.module';
import { ResilienceModule } from './common/monitoring/resilience/resilience.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './common/health/health.module';
import { LoggerService } from './common/log/logger.service';
import { MsConfigModule } from './module/ms-confi/module';
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: parseInt('60000'),
      limit: parseInt('100'),
    }]),
    ResilienceModule,
    MetricsModule,
    HealthModule,
    MsPersoModule,
    AuthModule,
    MsConfigModule,
  ],
  controllers: [],
  providers: [LoggerService],
})
export class AppModule { }
