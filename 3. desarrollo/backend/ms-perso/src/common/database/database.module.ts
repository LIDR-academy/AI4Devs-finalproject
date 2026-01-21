import { Module, Global } from '@nestjs/common';
import { PgService } from './pg.config';
import { LoggerService } from '../log/logger.service';

@Global()
@Module({
  providers: [PgService, LoggerService],
  exports: [PgService, LoggerService],
})
export class DatabaseModule {}
