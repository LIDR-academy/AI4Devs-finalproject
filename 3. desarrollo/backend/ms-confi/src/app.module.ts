import { Module } from '@nestjs/common';
import { ParameterModule } from './module/parameter/parameter.module';
import { ManagementModule } from './module/management/management.module';
import { OperationModule } from './module/operation/operation.module';
import { SearchModule } from './module/search/search.module';
import { DatabaseModule } from './common';
import { HealthModule } from './common/health/health.module';
import { LoggerService } from './common/log/logger.service';

@Module({
  imports: [
    DatabaseModule,
    ManagementModule,
    OperationModule,
    SearchModule,
    ParameterModule,
    HealthModule
  ],
  controllers: [],
  providers: [LoggerService],
})
export class AppModule {}
