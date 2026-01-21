import { Module } from '@nestjs/common';
import { NacioController } from './controller/controller';
import { NacioService } from '../infrastructure/service/service';
import { NacioDBRepository } from '../infrastructure/repository/repository';
import { NacioContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [NacioController, NacioContext],
  providers: [NacioDBRepository, NacioService],
})
export class NacioModule { }

