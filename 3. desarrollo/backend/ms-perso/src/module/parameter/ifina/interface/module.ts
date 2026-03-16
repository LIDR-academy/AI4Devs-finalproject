import { Module } from '@nestjs/common';
import { IfinaController } from './controller/controller';
import { IfinaService } from '../infrastructure/service/service';
import { IfinaDBRepository } from '../infrastructure/repository/repository';
import { IfinaContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [IfinaController, IfinaContext],
  providers: [IfinaDBRepository, IfinaService],
})
export class IfinaModule { }

