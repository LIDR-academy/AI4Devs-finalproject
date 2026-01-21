import { Module } from '@nestjs/common';
import { ToficController } from './controller/controller';
import { ToficService } from '../infrastructure/service/service';
import { ToficDBRepository } from '../infrastructure/repository/repository';
import { ToficContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ToficController, ToficContext],
    providers: [ToficDBRepository, ToficService],
})
export class ToficModule { }
