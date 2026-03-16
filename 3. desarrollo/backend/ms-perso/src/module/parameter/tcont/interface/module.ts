import { Module } from '@nestjs/common';
import { TcontController } from './controller/controller';
import { TcontService } from '../infrastructure/service/service';
import { TcontDBRepository } from '../infrastructure/repository/repository';
import { TcontContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TcontController, TcontContext],
  providers: [TcontDBRepository, TcontService],
})
export class TcontModule { }

