import { Module } from '@nestjs/common';
import { EmpreController } from './controller/controller';
import { EmpreService } from '../infrastructure/service/service';
import { EmpreDBRepository } from '../infrastructure/repository/repository';
import { EmpreContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [EmpreController, EmpreContext],
    providers: [EmpreDBRepository, EmpreService],
})
export class EmpreModule { }
