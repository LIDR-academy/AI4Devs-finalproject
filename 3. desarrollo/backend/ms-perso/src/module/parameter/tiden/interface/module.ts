import { Module } from '@nestjs/common';
import { TidenController } from './controller/controller';
import { TidenService } from '../infrastructure/service/service';
import { TidenDBRepository } from '../infrastructure/repository/repository';
import { TidenContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [TidenController, TidenContext],
    providers: [TidenDBRepository, TidenService],
})
export class TidenModule { }
