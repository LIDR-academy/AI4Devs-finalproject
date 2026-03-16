import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PgService } from '../database/pg.config';

@Module({
  controllers: [HealthController],
  providers: [PgService],
  exports: []
})
export class HealthModule { }
