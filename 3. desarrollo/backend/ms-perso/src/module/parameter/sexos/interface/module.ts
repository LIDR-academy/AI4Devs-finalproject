import { Module } from '@nestjs/common';
import { SexosController } from './controller/controller';
import { SexosService } from '../infrastructure/service/service';
import { SexosDBRepository } from '../infrastructure/repository/repository';
import { SexosContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SexosController, SexosContext],
  providers: [SexosDBRepository, SexosService],
})
export class SexosModule { }

