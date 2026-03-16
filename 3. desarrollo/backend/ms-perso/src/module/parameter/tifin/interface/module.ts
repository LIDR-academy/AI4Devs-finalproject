import { Module } from '@nestjs/common';
import { TifinController } from './controller/controller';
import { TifinService } from '../infrastructure/service/service';
import { TifinDBRepository } from '../infrastructure/repository/repository';
import { TifinContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TifinController, TifinContext],
  providers: [TifinDBRepository, TifinService],
})
export class TifinModule { }

