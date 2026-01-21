import { Module } from '@nestjs/common';
import { PerfiController } from './controller/controller';
import { PerfiService } from '../infrastructure/service/service';
import { PerfiDBRepository } from '../infrastructure/repository/repository';
import { PerfiContext } from './context/context';
import { DatabaseModule } from 'src/common/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [PerfiController, PerfiContext],
    providers: [PerfiDBRepository, PerfiService],
})
export class PerfiModule { }
