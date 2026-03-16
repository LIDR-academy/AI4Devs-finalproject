import { Module } from '@nestjs/common';
import { TrepController } from './controller/controller';
import { TrepService } from '../infrastructure/service/service';
import { TrepDBRepository } from '../infrastructure/repository/repository';
import { TrepContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TrepController, TrepContext],
  providers: [TrepDBRepository, TrepService],
})
export class TrepModule { }

