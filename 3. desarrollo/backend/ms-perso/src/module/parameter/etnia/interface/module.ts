import { Module } from '@nestjs/common';
import { EtniaController } from './controller/controller';
import { EtniaService } from '../infrastructure/service/service';
import { EtniaDBRepository } from '../infrastructure/repository/repository';
import { EtniaContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EtniaController, EtniaContext],
  providers: [EtniaDBRepository, EtniaService],
})
export class EtniaModule { }

