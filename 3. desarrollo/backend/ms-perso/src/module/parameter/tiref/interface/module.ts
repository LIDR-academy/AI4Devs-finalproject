import { Module } from '@nestjs/common';
import { TirefController } from './controller/controller';
import { TirefService } from '../infrastructure/service/service';
import { TirefDBRepository } from '../infrastructure/repository/repository';
import { TirefContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TirefController, TirefContext],
  providers: [TirefDBRepository, TirefService],
})
export class TirefModule { }

