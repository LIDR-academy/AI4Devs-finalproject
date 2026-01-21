import { Module } from '@nestjs/common';
import { TpersController } from './controller/controller';
import { TpersService } from '../infrastructure/service/service';
import { TpersDBRepository } from '../infrastructure/repository/repository';
import { TpersContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TpersController, TpersContext],
  providers: [TpersDBRepository, TpersService],
})
export class TpersModule { }

