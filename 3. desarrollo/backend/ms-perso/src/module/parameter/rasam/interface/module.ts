import { Module } from '@nestjs/common';
import { RasamController } from './controller/controller';
import { RasamService } from '../infrastructure/service/service';
import { RasamDBRepository } from '../infrastructure/repository/repository';
import { RasamContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [RasamController, RasamContext],
  providers: [RasamDBRepository, RasamService],
})
export class RasamModule { }

