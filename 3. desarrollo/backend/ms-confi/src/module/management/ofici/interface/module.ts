import { Module } from '@nestjs/common';
import { OficiController } from './controller/controller';
import { OficiService } from '../infrastructure/service/service';
import { OficiDBRepository } from '../infrastructure/repository/repository';
import { OficiContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [OficiController, OficiContext],
    providers: [OficiDBRepository, OficiService],
})
export class OficiModule { }
