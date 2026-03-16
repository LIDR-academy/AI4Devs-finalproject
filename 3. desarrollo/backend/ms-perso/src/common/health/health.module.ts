import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PgService } from '../database/pg.config';
import { HealthContext } from './health.context';

@Module({
  controllers: [HealthController, HealthContext],
  providers: [PgService],
  exports: []
})
export class HealthModule { }
