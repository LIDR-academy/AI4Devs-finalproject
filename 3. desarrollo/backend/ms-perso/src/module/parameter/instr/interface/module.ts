import { Module } from '@nestjs/common';
import { InstrController } from './controller/controller';
import { InstrService } from '../infrastructure/service/service';
import { InstrDBRepository } from '../infrastructure/repository/repository';
import { InstrContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [InstrController, InstrContext],
  providers: [InstrDBRepository, InstrService],
})
export class InstrModule { }

